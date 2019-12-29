import commonTypes = require("../commonTypes");

interface ApexClass {
  Id: string;
  Name: string;
  Body?: string;
  SymbolTable: SymbolTable;
}

interface SymbolTable {
  methods: Array<Methods>;
  // Change to be a generic property bag.
  tableDeclaration: TableDeclaration;
}

interface Methods {
  name: string;
  location: Location;
}

interface Location {
  column: number;
  line: number;
}

interface TableDeclaration {
  annotations: Array<TableDeclarationAnotations>;
}

interface TableDeclarationAnotations {
  name: string;
}

export class ApexClassItem implements ApexClass {
  Id: string;
  Name: string;
  Body?: string;
  SymbolTable: SymbolTable;
  LineHitCount: commonTypes.NumberKeyValuePair<number>;

  constructor(apexClassItem: ApexClass) {
    this.Id = apexClassItem.Id;
    this.Name = apexClassItem.Name;
    this.Body = apexClassItem.Body;
    this.SymbolTable = apexClassItem.SymbolTable;
    this.LineHitCount = {};
  }

  public isTest(): Boolean {
    return this.SymbolTable.tableDeclaration.annotations.some(
      (a: { name: string }) => a.name == "IsTest"
    );
  }

  public addStatementHitCount(linesHit: Array<number>, hitCount: number): void {
    linesHit.forEach(line => {
      if (!this.LineHitCount[line]) {
        this.LineHitCount[line] = 0;
      }
      this.LineHitCount[line] = this.LineHitCount[line] + hitCount;
    });
  }

  public className(): string {
    return this.Name;
  }

  public classFileName(): string {
    return `${this.Name}.cls`;
  }

  // If no hits then indicates no coverage so all lines should come back with zero hit count ...
  public statementHits(): commonTypes.NumberKeyValuePair<number> {
    return this.LineHitCount;
  }
}
