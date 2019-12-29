import commonTypes = require('../commonTypes');

// Branchmap not currently defined ... to do this successfully we need to interpret the Apex code
interface IstanbulCodeCoverage {
  path: string;
  s: commonTypes.NumberKeyValuePair<number>;
  b: commonTypes.NumberKeyValuePair<number>;
  f: commonTypes.NumberKeyValuePair<number>;
  fnMap: commonTypes.NumberKeyValuePair<FunctionDefinition>;
  statementMap: commonTypes.NumberKeyValuePair<LocationDefinition>;
  branchMap: Object;
}

interface FunctionDefinition {
  name: string;
  line: number;
  loc: LocationDefinition;
}

interface LocationDefinition {
  start: LineColumnDefinition;
  end: LineColumnDefinition;
}

interface LineColumnDefinition {
  line: number;
  column: number;
}

export class IstanbulCoverageItem implements IstanbulCodeCoverage {
  name: string;
  path: string;
  s: commonTypes.NumberKeyValuePair<number>;
  b: commonTypes.NumberKeyValuePair<number>;
  f: commonTypes.NumberKeyValuePair<number>;
  fnMap: commonTypes.NumberKeyValuePair<FunctionDefinition>;
  statementMap: commonTypes.NumberKeyValuePair<LocationDefinition>;
  branchMap: Object;

  constructor(name: string) {
    this.name = name;
    this.path = '';
    this.s = {};
    this.b = {};
    this.f = {};
    this.fnMap = {};
    this.statementMap = {};
    this.branchMap = {};
  }
}
