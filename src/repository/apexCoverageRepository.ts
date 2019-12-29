import { ApexCoverageItem } from '../model/apexCoverage';
import { core } from '@salesforce/command';

export class ApexCoverageRepository {
  protected org: core.Org;
  protected coverageData: Array<ApexCoverageItem>;

  constructor(org: core.Org) {
    this.org = org;
  }

  // query<T>(soql: string, options?: ExecuteOptions, callback?: (err: Error, result: QueryResult<T>) => void): Query<QueryResult<T>>;
  // queryMore<T>(locator: string, options?: ExecuteOptions, callback?: (err: Error, result: QueryResult<T>) => void): Promise<QueryResult<T>>;
  public async init() {
    let coverageQuery = 'SELECT ApexTestClass.Name,Coverage,TestMethodName,ApexClassOrTrigger.Id,ApexClassOrTrigger.Name FROM ApexCodeCoverage';
    let conn = this.org.getConnection().tooling;
    let coverageResults = await conn.query<ApexCoverageItem>(coverageQuery);
    this.coverageData = [];
    coverageResults.records.forEach((coverageItem) => {
      this.coverageData.push(new ApexCoverageItem(coverageItem));
    });
    return this;
  }

  public findAll(): Array<ApexCoverageItem> {
    return this.coverageData;
  }
}
