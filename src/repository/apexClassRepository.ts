import { ApexClassItem } from '../model/apexClass';
import { core } from '@salesforce/command';

export class ApexClassRepository {
  protected org: core.Org;
  protected classData: Array<ApexClassItem>;

  constructor(org: core.Org) {
    this.org = org;
  }

  public async init() {
    let classQuery = 'SELECT Id, Name, Body, SymbolTable FROM ApexClass WHERE Id IN (SELECT ApexClassorTriggerId FROM ApexCodeCoverage)';
    let conn = this.org.getConnection().tooling;
    let classResults = await conn.query<ApexClassItem>(classQuery);
    this.classData = [];
    classResults.records.forEach((classItem) => {
      this.classData.push(new ApexClassItem(classItem));
    });
    return this;
  }

  public findAll(): Array<ApexClassItem> {
    return this.classData;
  }

  public findById(id: string): ApexClassItem {
    return this.classData.filter(item => item.Id == id)[0];
  }
}
