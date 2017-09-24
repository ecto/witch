const TYPE_CALL = 'call';
const TYPE_FUNCTION_DEFINITION = 'functionDefinition';
const TYPE_SHAPE_DEFINITION = 'shapeDefinition';
const TYPE_ATTRIBUTE_DEFINITION = 'attributeDefinition';
const TYPE_SHAPE_IDENTIFIER = 'shapeIdentifier';
const TYPE_CREATOR = 'creator';
const IDENTIFIER_FUNCTION = 'fn';
const IDENTIFIER_SHAPE = 'shape';
const IDENTIFIER_RETURN = 'return';
const IDENTIFIER_NEW = 'new';

module.exports = class Parser {
  run(tokens) {
    return tokens.map(({type, value, children}) => {
      if (this.isFunctionDefinition(value)) {
        return {
          type: TYPE_FUNCTION_DEFINITION,
          name: value[1].value,
          args: value.slice(2),
          children: this.run(children),
        };
      }

      if (this.isShapeDefinition(value)) {
        return {
          type: TYPE_SHAPE_DEFINITION,
          name: value[1].value,
          children: this.run(children),
        };
      }

      if (this.isAttributeDefinition(value)) {
        return {
          type: TYPE_ATTRIBUTE_DEFINITION,
          name: value[1].value,
          shape: value[0].value,
        };
      }

      if (this.isReturn(value)) {
        return {
          type: TYPE_RETURN,
          name: value[1] && value[1].value,
        };
      }

      if (this.isCreator(value)) {
        return {
          type: TYPE_CREATOR,
          name: value[2].value,
          shape: value[1].value,
        };
      }

      return {
        type: TYPE_CALL,
        name: value[0].value,
        args: value.slice(1),
      };
    });
  }

  isFunctionDefinition(values) {
    return values[0].value === IDENTIFIER_FUNCTION;
  }

  isShapeDefinition(values) {
    return values[0].value === IDENTIFIER_SHAPE;
  }

  isAttributeDefinition(values) {
    return values[0].type === TYPE_SHAPE_IDENTIFIER;
  }

  isCreator(values) {
    return values[0].value === IDENTIFIER_NEW;
  }

  isReturn(values) {
    return values[0].type === IDENTIFIER_RETURN;
  }

  print(tokens, depth = 0) {
    tokens.forEach(({type, name, args, children, shape}) => {
      const push = new Array(depth * 2 + 1).join(' ');

      if (type === TYPE_FUNCTION_DEFINITION) {
        console.log(
          push,
          'FUNCTION',
          name,
          args.map(arg => [arg.value, arg.type])
        );
        this.print(children, depth + 1);
        return;
      }

      if (type === TYPE_SHAPE_DEFINITION) {
        console.log(push, 'SHAPE', name);
        this.print(children, depth + 1);
        return;
      }

      if (type === TYPE_ATTRIBUTE_DEFINITION) {
        console.log(push, 'ATTRIBUTE', name, shape);
        return;
      }

      if (type === TYPE_CALL) {
        console.log(push, 'CALL', name, args.map(arg => [arg.value, arg.type]));
        return;
      }

      if (type === TYPE_CREATOR) {
        console.log(push, 'CREATE', shape, name);
        return;
      }

      console.log(push, '??????????????', type, name, args);
    });
  }
};
