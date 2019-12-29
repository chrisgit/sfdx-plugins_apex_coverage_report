import commonTypes = require('../commonTypes');
import * as fs from 'fs';
import path = require('path');

export class FileSystemRepository {
  RootFolder: string;
  Files: commonTypes.StringKeyValuePair<string>;

  constructor(rootFolder: string) {
    this.RootFolder = rootFolder || '.';
    this.Files = {};
    const walkSync = (dir, filelist = []) => {
      fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
          ? walkSync(path.join(dir, file), filelist)
          : filelist.concat(path.join(dir, file));

      });
      return filelist;
    }
    let files = walkSync(this.RootFolder);
    files.forEach((filePath) => {
      let fileName = path.parse(filePath).base.toLowerCase();
      if (path.isAbsolute(filePath)) {
        this.Files[fileName] = path.relative(process.cwd(), filePath);
      } else {
        this.Files[fileName] = path.join(process.cwd(), filePath);
      }
    });
  }

  public findByName(fileName: string): string {
    let lowerFileName = fileName.toLowerCase();
    return this.Files[lowerFileName];
  }
}
