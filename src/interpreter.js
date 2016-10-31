const TYPES = require('./types');
const {ERRORS} = require('./error');
const special = require('./special');

class Interpreter {
  constructor(errorHandler, filePath) {
    this.errorHandler = errorHandler;
    this.filePath = filePath;
  }

  interpretList(x, env) {
    if (x.length > 0 && x[0].value in special) {
      const func = special[x[0].value];
      return func.bind(this)(x, env);
    }

    const list = x.map(item => this.interpret(item, env));

    // if the first item of the list is not a
    // string / number /bool, it is interpreted as
    // an identifier, which is a function call
    // (if first argument).
    // and if there is nothing at its place
    // in the env, then the script is trying
    // to call a function that doesn't exist
    if (typeof list[0] === 'undefined') {
      return this.errorHandler.panic(x[0], ERRORS.UNDEFINED);
    }

    if (list[0] instanceof Function) {
      return list[0].apply(undefined, list.slice(1));
    }

    return list;
  }

  interpret(x, env) {
    if (Array.isArray(x)) {
      return this.interpretList(x, env);
    }

    if (x.type === TYPES.IDENTIFIER) {
      return env.get(x.value);
    }

    if (
      x.type === TYPES.NUMBER ||
      x.type === TYPES.STRING
    ) {
      return x.value;
    }

    console.log('INTERPRET UNKNOWN', x);
  }

  // walk tree x, making optimizations, signaling SyntaxError
  expand(x, topLevel = false) {
    // punt for now
    return x;

    // constant -> unchanged
    if (!Array.isArray(x)) {
      return x;
    }
  }
}

module.exports = {
  Interpreter,
};
