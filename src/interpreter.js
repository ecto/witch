const TYPES = require('./types');
const Env = require('./env');
const {ERRORS} = require('./error');

class Interpreter {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;

    this.special = {
      set: (x, env) => {
        const [_, name, exp] = x;
        return env.set(name.value, this.interpret(exp, env));
      },

      // (call name args)

      // fn could actually be implemented
      // as a macro with form:
      // (set name (lambda (args) (body)))
      // where lambda is implemented as
      // below without set + name
      fn: (x, env) => {
        const [_, name, params, body] = x;

        const fn = (...args) => {
          const scope = params.reduce((acc, x, i) => {
            acc[x.value] = args[i];
            return acc;
          }, {});

          return this.interpret(body, new Env(scope, env));
        }

        return env.set(name.value, fn);
      },

      if: (x, env) => {
        this.interpret(x[1], env) ?
          this.interpret(x[2], env) :
          x[3] && this.interpret(x[3], env);

        return null;
      },

      '>': (x, env) => {
        return this.interpret(x[1], env) > this.interpret(x[2], env);
      },
      '<': (x, env) => {
        return this.interpret(x[1], env) < this.interpret(x[2], env);
      },
      '>=': (x, env) => {
        return this.interpret(x[1], env) >= this.interpret(x[2], env);
      },
      '<=': (x, env) => {
        return this.interpret(x[1], env) <= this.interpret(x[2], env);
      },
      '=': (x, env) => {
        return this.interpret(x[1], env) === this.interpret(x[2], env);
      },
    };
  }

  interpretList(x, env) {
    if (x.length > 0 && x[0].value in this.special) {
      return this.special[x[0].value](x, env);
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
