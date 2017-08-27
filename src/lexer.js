const fs = require('fs');
const path = require('path');
const peg = require('pegjs');

const GRAMMAR_FILE = 'grammar.peg';

module.exports = class Lexer {
  constructor() {
    const grammarPath = path.resolve(__dirname, GRAMMAR_FILE);
    const grammar = fs.readFileSync(grammarPath).toString();
    this.parser = peg.generate(grammar);
  }

  run(input) {
    let out;

    try {
      out = this.parser.parse(input);
    } catch (e) {
      this.handleError(input, e);
    }

    return out;
  }

  handleError(input, e) {
    console.log(e.name);
    console.log();
    console.log(e.message);
    console.log();

    if (e.location) {
      console.log('Line', e.location.start.line);
      const lines = input.split(`
`);
      const line = lines[e.location.start.line - 1];
      const callout = new Array(line.length);
      callout.fill(' ');
      callout.fill('^', e.location.start.column - 1, e.location.end.column - 1);
      console.log(line);
      console.log(callout.join(''));
    }

    process.exit(1);
  }

  print(tokens, depth = 0) {
    tokens.forEach(({type, value, children}) => {
      if (type === 'statement') {
        const line = [
          ...new Array(depth * 2 + 1).join(' '),
          ...value.map(chunk => chunk.value).join(' '),
        ].join('');

        console.log(line);
      }

      if (children) {
        this.print(children, depth + 1);
      }
    });
  }
};
