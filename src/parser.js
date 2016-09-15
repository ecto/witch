const TYPES = require('./types');

class Parser {
  constructor(rawCode) {
    this.rawCode = rawCode;
    this.tokens = this.tokenize(this.rawCode);
  }

  categorize(token) {
    if (isNumber(token)) {
      return {
        type: TYPES.NUMBER,
        value: parseFloat(token),
      };
    }

    if (
      (
        token[0] === '"' &&
        token.slice(-1) === '"'
      ) || (
        token[0] === "'" &&
        token.slice(-1) === "'"
      )
    ) {
      return {
        type: TYPES.STRING,
        value: token.slice(1, -1),
      };
    }

    return {
      type: TYPES.IDENTIFIER,
      value: token,
    };
  }

  tokenize(input) {
    return input.split('"')
      .map((x, i) => {
         if (i % 2 === 0) {
           // not in string
           return x.
             replace(/\(/g, ' ( ').
             replace(/\)/g, ' ) ');
         } else {
           // in string
           return x.replace(/ /g, '!whitespace!');
         }
      })
      .join('"')
      .trim()
      .split(/\s+/)
      .map(x => x.replace(/!whitespace!/g, ' '));
  }

  run(tokens = this.tokens, list = []) {
    var token = tokens.shift();

    if (token === undefined) {
      return list;
    }

    if (token === '(') {
      list.push(this.run(tokens, []));
      return this.run(tokens, list);
    }

    if (token === ')') {
      return list;
    }

    const newToken = this.categorize(token);
    return this.run(tokens, list.concat(newToken));
  }
}

function parse(program) {
  const parser = new Parser(program);
  const tree = parser.run();

  return tree;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = {
  parse,
};
