const path = require('path');
const {standardEnv} = require('./util');
const {parse} = require('./parser');
const {File, getScript} = require('./file');
const {Interpreter} = require('./interpreter');
const {ErrorHandler} = require('./error');

class CLI {
  run() {
    if (process.argv.length === 2) {
      console.log('No script specified!');
      process.exit(1);
    }

    const globalEnv = standardEnv();

    const scriptName = process.argv.pop();
    const currentDir = process.cwd();
    const scriptPath = path.resolve(currentDir, scriptName);

    const file = new File(scriptPath);
    const fileData = file.read();
    const tree = parse(fileData);
    const errorHandler = new ErrorHandler();
    const interpreter = new Interpreter(errorHandler, scriptPath);
    interpreter.interpret(tree, globalEnv);
  }
}

module.exports = {
  CLI,
};
