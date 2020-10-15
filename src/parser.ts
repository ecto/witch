type AtomKind = 'identifier' | 'literal';
type AtomType = 'string' | 'number';
export type Atom = {
  kind: AtomKind;
  type?: AtomType;
  value: string | number;
};
export type List = Array<Atom | List>;

const CHAR_START = '[';
const CHAR_END = ']';
const CHAR_WHITESPACE = /\s/;

export default class Parser {
  input: string;

  constructor(input: string) {
    this.input = input;
  }

  atom(token) {
    const maybeNumber = parseInt(token, 10);
    if (!Number.isNaN(maybeNumber)) {
      return {
        kind: 'literal',
        type: 'number',
        value: maybeNumber,
      };
    }

    return {
      kind: 'identifier',
      value: token,
    };
  }

  tokenize() {
    return this.input
      .split(CHAR_START)
      .join(` ${CHAR_START} `)
      .split(CHAR_END)
      .join(` ${CHAR_END} `)
      .split(CHAR_WHITESPACE)
      .filter((token) => token.length);
  }

  read(tokens, list = []) {
    const token = tokens.shift();

    if (!token) {
      return list;
    }

    if (token === CHAR_START) {
      list.push(this.read(tokens, []));
      return this.read(tokens, list);
    }

    if (token === CHAR_END) {
      return list;
    }

    return this.read(tokens, list.concat(this.atom(token)));
  }

  run(): List {
    const tokens = this.tokenize();
    return this.read(tokens);
  }
}
