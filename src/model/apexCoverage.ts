interface ApexCodeCoverage {
  ApexTestClass: ApexTestClass;
  Coverage: ApexCoverage;
  TestMethodName: string;
  ApexClassOrTrigger: ApexClassOrTrigger;
}

interface ApexTestClass {
  Name: string;
  attributes: ApexAttribute;
}

interface ApexCoverage {
  coveredLines: Array<number>;
  uncoveredLines: Array<number>;
}

interface ApexClassOrTrigger {
  Id: string;
  Name: string;
}

interface ApexAttribute {
  type: string;
  url: string;
}

export class ApexCoverageItem implements ApexCodeCoverage {
  ApexTestClass: ApexTestClass;
  Coverage: ApexCoverage;
  TestMethodName: string;
  ApexClassOrTrigger: ApexClassOrTrigger;

  constructor(apexCoverage: ApexCoverageItem) {
    this.ApexTestClass = apexCoverage.ApexTestClass;
    this.Coverage = apexCoverage.Coverage;
    this.TestMethodName = apexCoverage.TestMethodName;
    this.ApexClassOrTrigger = apexCoverage.ApexClassOrTrigger;
  }

  public name(): string {
    return this.ApexTestClass.Name;
  }

  public isApexClass(): Boolean {
    return this.ApexTestClass.attributes.type == 'ApexClass';
  }

  public isApexTrigger(): Boolean {
    return this.ApexTestClass.attributes.type == 'ApexTrigger';
  }

  public coveredLines(): Array<number> {
    return this.Coverage.coveredLines;
  }

  public uncoveredLines(): Array<number> {
    return this.Coverage.uncoveredLines;
  }

  public classOrTriggerName(): string {
    return this.ApexClassOrTrigger.Name;
  }

}
