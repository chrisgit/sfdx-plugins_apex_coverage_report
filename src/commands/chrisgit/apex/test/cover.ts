import { core, flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as fs from "fs";
import path = require("path");

import commonTypes = require("../../../../commonTypes");
import { ApexClassItem } from "../../../../model/apexClass";
import { IstanbulCoverageItem } from "../../../../model/istanbulCoverage";
import { FileSystemRepository } from "../../../../repository/fileSystemRepository";
import { ApexClassRepository } from "../../../../repository/apexClassRepository";
import { ApexCoverageRepository } from "../../../../repository/apexCoverageRepository";

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);
const messages = core.Messages.loadMessages(
  "sfdx-plugins-apex_coverage_report",
  "cover"
);

const supportedReports = ["text", "clover", "lcov", "cobertura"];

export default class ApexCoverage extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");
  public static examples = ["$ sfdx chrigit:apex:test:cover -r cobertura"];
  public static args = [{ name: "file" }];

  // Use flags.string for now, ought to be enum
  protected static flagsConfig = {
    format: flags.string({
      char: "f",
      required: true,
      description: messages.getMessage("flagReportFormatDescription"),
      longDescription: messages.getMessage("flagReportFormatLongDescription"),
      options: ["all"].concat(supportedReports)
    }),
    source: flags.string({
      char: "s",
      required: false,
      description: messages.getMessage("flagSourceLocationDescription"),
      longDescription: messages.getMessage("flagSourceLocationLongDescription")
    })
  };

  protected static requiresUsername = true;
  protected static supportsDevhubUsername = true;
  protected static requiresProject = false;

  protected temporaryFileFolder = "./apex/classes";

  public async run(): Promise<AnyJson> {
    // Temporary folder to store source code if not found on disk
    this.createTemporarySourceFolder(this.temporaryFileFolder);

    // Return test results
    let apexCoverageRepository = new ApexCoverageRepository(this.org);
    await apexCoverageRepository.init();
    let coverageResults = apexCoverageRepository.findAll();
    if (!coverageResults || coverageResults.length <= 0) {
      throw new core.SfdxError(messages.getMessage("errorNoCoverageResults", [this.org.getOrgId()]));
    }

    // Return Apex classes
    let apexClassRepository = new ApexClassRepository(this.org);
    await apexClassRepository.init();
    let apexClasses = apexClassRepository.findAll();

    // Repository to help locate Apex classes on local filesystem
    let fileSystemRepository = new FileSystemRepository(this.flags.source);

    this.ux.styledHeader("Calculating Code Coverage Summary");
    this.ux.log(`Found ${coverageResults.length.toString()} test coverage records`);
    this.ux.log(`Found ${apexClasses.length.toString()} Apex class records`);

    // Loop through each coverage record building up statement hit data for the Apex classes or Triggers (only classes supported)
    coverageResults.forEach(coverageItem => {
      if (!coverageItem.isApexClass()) {
        return;
      }
      let classId = coverageItem.ApexClassOrTrigger.Id;
      let apexClass = apexClassRepository.findById(classId);
      // If apexClass null here then must be trigger?
      if (apexClass === undefined) {
        return;
      }
      apexClass.addStatementHitCount(coverageItem.Coverage.coveredLines, 1);
      apexClass.addStatementHitCount(coverageItem.Coverage.uncoveredLines, 0);
    });

    // For each Apex class create a record for Istanbul
    let covered: commonTypes.StringKeyValuePair<IstanbulCoverageItem> = {};
    apexClasses.forEach(apexClass => {
      if (apexClass.isTest()) {
        return;
      }
      let filePath = fileSystemRepository.findByName(apexClass.classFileName()) || this.saveApexSourceToDisk(this.temporaryFileFolder, apexClass);
      let item = this.createNewCoverageItem(filePath, apexClass);
      covered[filePath] = item;
    });

    // Produce requested reports
    let reportFormats = this.flags.format === "all" ? supportedReports : [this.flags.format];
    this.run_coverage_report(covered, reportFormats);

    // https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
    let result = { status: "success", coverage: {} };
    if (this.flags.json) {
      result.coverage = JSON.parse(JSON.stringify(covered));
    }
    return result;
  }

  createTemporarySourceFolder(folder: string) {
    !fs.existsSync(this.temporaryFileFolder) &&
      fs.mkdirSync(this.temporaryFileFolder, { recursive: true });
  }

  // Istanbul Apex
  createNewCoverageItem(name: string, apexClass: ApexClassItem) {
    let item = new IstanbulCoverageItem(name);
    item.path = name;
    item.s = apexClass.statementHits();
    this.createFunctionMap(apexClass, item);
    this.createStatementMap(apexClass, item);
    return item;
  }

  saveApexSourceToDisk(folder: string, apexClass: ApexClassItem) {
    // File not found in file system to create it in arbitrary folder
    let tempFileName = path.join(folder, apexClass.classFileName());
    fs.writeFileSync(tempFileName, apexClass.Body);
    return tempFileName;
  }

  // TODO: Move to another class
  // Given the statement hits create a method map
  createFunctionMap(apexClass: ApexClassItem, item: IstanbulCoverageItem) {
    let methodCounter = 0;
    apexClass.SymbolTable.methods.forEach(method => {
      ++methodCounter;
      item.f[methodCounter] = item.s[method.location.line] || 0;
      item.fnMap[methodCounter] = {
        name: method.name,
        line: methodCounter,
        loc: {
          start: {
            line: method.location.line,
            column: method.location.column
          },
          end: {
            line: method.location.line,
            column: method.location.column
          }
        }
      };
    });
  }

  // Statements (represented by s property in Istanbul) are an index to statement map so we need to
  // re-write Statements to be contiguous; before now they represent a KVP of line numbers and hits
  // Also this does NOT add the method range to statement map so will need to change
  // in the future to add them too
  createStatementMap(apexClass: ApexClassItem, item: IstanbulCoverageItem) {
    let newStatementIndex: commonTypes.NumberKeyValuePair<number> = {};
    let counter = 0;
    Object.keys(item.s).forEach(k => {
      ++counter;
      newStatementIndex[counter] = item.s[k];
      item.statementMap[counter] = {
        start: {
          line: parseInt(k),
          column: 1
        },
        end: {
          line: parseInt(k),
          column: 80
        }
      };
    });
    item.s = newStatementIndex;
  }

  run_coverage_report(
    covered: commonTypes.StringKeyValuePair<IstanbulCoverageItem>,
    reportFormats: Array<string>
  ) {
    let istanbul = require("istanbul"),
      collector = new istanbul.Collector(),
      reporter = new istanbul.Reporter(),
      sync = false;
    collector.add(covered);
    reporter.addAll(reportFormats);
    reporter.write(collector, sync, function () { });
    this.ux.log(`${reportFormats.join(" ")} report(s) generated`);
  }
}
