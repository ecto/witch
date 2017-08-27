const TYPE_CALL = 'call';
const TYPE_DEFINITION = 'definition';
const IDENTIFIER_FUNCTION = 'fn';

module.exports = class Parser {
  run(tokens) {
    return tokens.map(({type, value, children}) => {
      if (this.isDefinition(value)) {
        return {
          type: TYPE_DEFINITION,
          name: value[1].value,
          args: value.slice(2),
          children: this.run(children),
        };
      }

      return {
        type: TYPE_CALL,
        name: value[0].value,
        args: value.slice(1),
      };
    });
  }

  isDefinition(values) {
    return values[0].value === IDENTIFIER_FUNCTION;
  }

  print(tokens, depth = 0) {
    tokens.forEach(({type, name, args, children}) => {
      const push = new Array(depth * 2 + 1).join(' ');

      if (type === TYPE_DEFINITION) {
        console.log(push, 'DEFINE', name, args.map(arg => arg.value));
        this.print(children, depth + 1);
        return;
      }

      if (type === TYPE_CALL) {
        console.log(push, 'CALL', name, args.map(arg => arg.value));
        return;
      }

      console.log('??????????????', type, name, args);
    });
  }
};
