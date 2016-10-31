const fs = require('fs');
const path = require('path');

const fileCache = {};

class File {
  constructor(path) {
    this.path = path;
  }

  read(cb) {
    try {
      const data = fs.readFileSync(this.path).toString();
      return data;
    } catch (e) {
      console.log('Could not read input script');
      process.exit(1);
    }
  }
}

module.exports = {
  File,
};
