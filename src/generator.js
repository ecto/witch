const llvm = require('llvm-node');

const MODULE_NAME = 'top';
const TYPE_FUNCTION = 'fn';
const TYPE_STRING = 'string';
const TYPE_NUMBER = 'number';
const TYPE_IDENTIFIER = 'identifier';
const TYPE_ARGUMENT = 'argument';
const TYPE_CALL = 'call';
const TYPE_DEFINITION = 'definition';

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

    return env;
  }

  run(statements, env = this.createEnv()) {
    statements.forEach(statement => {
      const {type} = statement;
      if (type === TYPE_CALL) {
        this.writeCall(statement, env);
      } else if (type === TYPE_DEFINITION) {
        this.writeDefinition(statement, env);
      } else {
        console.log('?????', statement);
      }
    });
  }

  verify() {
    llvm.verifyModule(this.module);
  }

  writeCall(statement, env) {
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
        if (!env[arg.value]) {
          console.log(Object.keys(env));
          throw new Error(
            'calling function with unknown indentifier ' + arg.value
          );
        }

        const int8Type = llvm.Type.getInt8Ty(this.context);
        const ref = env[arg.value].ref;
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
    console.log('STORE', arg.value);
    const store = this.builder.createStore(val, alloca);
    const bitcast = this.builder.createBitCast(alloca, int8Type.getPointerTo());
    return bitcast;
  }

  writeDefinition(statement, env) {
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

  print() {
    console.log(this.module.print());
  }

  saveToFile(filename) {
    llvm.writeBitcodeToFile(this.module, filename);
  }
};
