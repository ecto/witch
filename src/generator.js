const llvm = require('llvm-node');

const MODULE_NAME = 'top';
const TYPE_FUNCTION = 'fn';
const TYPE_STRING = 'string';
const TYPE_NUMBER = 'number';
const TYPE_IDENTIFIER = 'identifier';
const TYPE_SHAPE_IDENTIFIER = 'shapeIdentifier';
const TYPE_ARGUMENT = 'argument';
const TYPE_SHAPE = 'shape';
const TYPE_ATTRIBUTE = 'attribute';
const TYPE_VARIABLE = 'variable';
const STATEMENT_CALL = 'call';
const STATEMENT_FUNCTION_DEFINITION = 'functionDefinition';
const STATEMENT_SHAPE_DEFINITION = 'shapeDefinition';
const STATEMENT_ATTRIBUTE_DEFINITION = 'attributeDefinition';
const STATEMENT_CREATOR = 'creator';

module.exports = class Generator {
  constructor() {
    this.context = new llvm.LLVMContext();
    this.module = new llvm.Module(MODULE_NAME, this.context);
    this.builder = new llvm.IRBuilder(this.context);
  }

  // TODO move this to external library
  createEnv() {
    const env = {};
    const int8Type = llvm.Type.getInt8Ty(this.context);
    const intType = llvm.Type.getInt64Ty(this.context);
    const putsArgs = [int8Type.getPointerTo()];
    const putsType = llvm.FunctionType.get(intType, putsArgs, false);
    const putsFunc = this.module.getOrInsertFunction('puts', putsType);

    env['puts'] = {
      type: TYPE_FUNCTION,
      ref: putsFunc,
    };

    env['Pointer'] = {
      type: TYPE_SHAPE,
      ref: int8Type.getPointerTo(),
    };

    return env;
  }

  run(statements, env = this.createEnv()) {
    statements.forEach(statement => {
      const {type} = statement;

      if (type === STATEMENT_CALL) {
        this.writeCall(statement, env);
        return;
      }

      if (type === STATEMENT_FUNCTION_DEFINITION) {
        this.writeFunctionDefinition(statement, env);
        return;
      }

      if (type === STATEMENT_SHAPE_DEFINITION) {
        this.writeShapeDefinition(statement, env);
        return;
      }

      if (type === STATEMENT_ATTRIBUTE_DEFINITION) {
        this.writeAttributeDefinition(statement, env);
        return;
      }

      if (type === STATEMENT_CREATOR) {
        this.writeCreation(statement, env);
        return;
      }

      console.log(statement);
      throw new Error('Unknown statement type: ' + type);
    });
  }

  verify() {
    llvm.verifyModule(this.module);
  }

  writeCall(statement, env) {
    console.log('WRITE CALL', statement);
    // for every argument
    // if it's a string, allocate it
    // if it's an identifer, make sure it exists
    if (!env[statement.name]) {
      throw new Error('undefined variable ' + statement.name);
    }

    const args = [];

    statement.args.forEach(arg => {
      if (arg.type === TYPE_STRING) {
        const stringRef = this.writeStringAllocation(arg);
        args.push(stringRef);
      }

      if (arg.type === TYPE_NUMBER) {
        const numRef = this.writeNumberAllocation(arg);
        args.push(numRef);
      }

      if (arg.type === TYPE_IDENTIFIER) {
        // || arg.type === TYPE_SHAPE_IDENTIFIER) {
        if (!env[arg.value]) {
          console.log(Object.keys(env));
          throw new Error(
            'calling function with unknown indentifier ' + arg.value
          );
        }

        const int8Type = llvm.Type.getInt8Ty(this.context);
        const ref = env[arg.value].ref;
        console.log(ref);
        const bitcast = this.builder.createBitCast(
          ref,
          int8Type.getPointerTo()
        ); // todo function arg type
        args.push(bitcast);
      }
    });

    this.builder.createCall(env[statement.name].ref, args);
  }

  writeStringAllocation(arg) {
    const int8Type = llvm.Type.getInt8Ty(this.context);
    const arrType = llvm.ArrayType.get(int8Type, arg.value.length + 1); // +1 for null terminator
    const alloca = this.builder.createAlloca(arrType, arg.name);
    const val = llvm.ConstantDataArray.getString(this.context, arg.value);
    const store = this.builder.createStore(val, alloca);
    const bitcast = this.builder.createBitCast(alloca, int8Type.getPointerTo());
    return bitcast;
  }

  writeNumberAllocation(arg) {
    const int8Type = llvm.Type.getInt8Ty(this.context);
    const doubleType = llvm.Type.getDoubleTy(this.context);
    const alloca = this.builder.createAlloca(doubleType, arg.name);
    const val = llvm.ConstantFP.get(this.context, arg.value);
    const store = this.builder.createStore(val, alloca);
    const bitcast = this.builder.createBitCast(alloca, int8Type.getPointerTo());
    return bitcast;
  }

  writeFunctionDefinition(statement, env) {
    const intType = llvm.Type.getInt64Ty(this.context);
    const int8Type = llvm.Type.getInt8Ty(this.context);
    const args = [];
    const argNames = [];

    statement.args.forEach(arg => {
      args.push(int8Type.getPointerTo());
    });

    const funcType = llvm.FunctionType.get(intType, args, false);
    const func = llvm.Function.create(
      funcType,
      llvm.LinkageTypes.ExternalLinkage,
      statement.name,
      this.module
    );

    // this somehow works
    func.getArguments().forEach((arg, i) => {
      const name = statement.args[i].value;
      arg.name = name;
      env[name] = {
        type: TYPE_ARGUMENT,
        ref: arg,
      };
    });

    env[statement.name] = {
      type: TYPE_FUNCTION,
      ref: func,
    };
    const entry = llvm.BasicBlock.create(this.context, 'entrypoint', func);
    this.builder.setInsertionPoint(entry);

    this.run(statement.children, env);

    const zero = llvm.ConstantInt.get(this.context, 0, 64);
    this.builder.createRet(zero);
  }

  writeShapeDefinition(statement, env) {
    console.log('WRITE SHAPE DEFINITION', statement);

    // for each in children
    //    if type is attribute definition
    //    add to attributes array
    //    create struct
    const attributes = [];
    const functions = [];
    statement.children.forEach(childStatement => {
      if (childStatement.type === STATEMENT_ATTRIBUTE_DEFINITION) {
        attributes.push(childStatement);
      }
      if (childStatement.type === STATEMENT_FUNCTION_DEFINITION) {
        functions.push(childStatement);
      }
    });

    const attributeTypes = attributes.map(attr => env[attr.shape].ref);
    const struct = llvm.StructType.create(this.context, statement.name);
    struct.setBody(attributeTypes);

    env[statement.name] = {
      type: TYPE_SHAPE,
      ref: struct,
      attributes,
    };

    // for each in children
    //    if type is function
    //      rewrite name
    //      add to newChildren
    //      this.run newChildren
    //    add all to env
    //      new() as env[name]
    console.log('FUNCTIONS', functions);
  }

  writeAttributeDefinition(statement, env) {
    console.log('WRITE ATTRIBUTE DEFINITION', statement);
    env[statement.name] = {
      type: TYPE_ATTRIBUTE,
      name: statement.name,
      shape: statement.shape,
    };
  }

  writeCreation(statement, env) {
    console.log('WRITE CREATION', statement);

    if (!env[statement.shape]) {
      console.log(Object.keys(env));
      throw new Error('calling function with unknown indentifier ' + arg.value);
    }

    const type = env[statement.shape].ref;
    console.log('0-------', type);

    const zero = llvm.ConstantInt.get(this.context, 0, 64);
    const alloca = this.builder.createAlloca(type, zero, statement.name);

    env[statement.name] = {
      type: TYPE_VARIABLE,
      name: statement.name,
      shape: statement.shape,
      ref: alloca,
    };
  }

  print() {
    console.log(this.module.print());
  }

  saveToFile(filename) {
    llvm.writeBitcodeToFile(this.module, filename);
  }
};
