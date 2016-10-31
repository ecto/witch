const path = require('path');
const {File} = require('./file');
const {parse} = require('./parser');
const Env = require('./env');
const {Interpreter} = require('./interpreter');
const interpreterStuff = require('./interpreter');

const s = module.exports = {};

s['set'] = (x, env) => {
  const [_, name, value] = x;
  return env.set(name.value, this.interpret(value, env));
};

// (call name args)
// fn could actually be implemented
// as a macro with form:
// (set name (lambda (args) (body)))
// where lambda is implemented as
// below without set + name
s['fn'] = (x, env) => {
  const [_, name, params, body] = x;

  const fn = (...args) => {
    const scope = params.reduce((acc, x, i) => {
      acc[x.value] = args[i];
      return acc;
    }, {});

    return this.interpret(body, new Env(scope, env));
  }

  return env.set(name.value, fn);
};

s['if'] = (x, env) => {
  this.interpret(x[1], env) ?
    this.interpret(x[2], env) :
    x[3] && this.interpret(x[3], env);

  return null;
};

s['>'] = (x, env) => {
  return this.interpret(x[1], env) > this.interpret(x[2], env);
};
s['<'] = (x, env) => {
  return this.interpret(x[1], env) < this.interpret(x[2], env);
};
s['>='] = (x, env) => {
  return this.interpret(x[1], env) >= this.interpret(x[2], env);
};
s['<='] = (x, env) => {
  return this.interpret(x[1], env) <= this.interpret(x[2], env);
};
s['='] = (x, env) => {
  return this.interpret(x[1], env) === this.interpret(x[2], env);
};

s['export'] = function(x, env) {
  const [_, name, value] = x;
  return env.parent &&
    env.parent.set(name.value, this.interpret(value, env)) ||
    null;
};
s['import'] = function(x, env) {
  const [_, moduleName, importList] = x;
  // TODO abstract resolving file
  const currentDir = path.dirname(this.filePath);
  const scriptPath = path.resolve(currentDir, moduleName.value);

  if (scriptPath === this.filePath) {
    return this.errorHandler.panic(x, ERRORS.SELF_IMPORT);
  }

  const file = new File(scriptPath);
  const fileData = file.read();

  // TODO pass file to parser
  const tree = parse(fileData);
  const childEnv = new Env({}, env);
  const interpreter = new this.constructor(this.errorHandler, scriptPath);
  const interpretation = interpreter.interpret(tree, childEnv);
  console.log('CHILD ENV', childEnv);

  // if there is an importList, get() each importList name
  // from the childEnv's exports and set it in the current env.
  // if there is no importList, get() everything from exports

  return interpretation;
};

