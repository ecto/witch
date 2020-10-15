import * as llvm from 'llvm-node';
import {List} from './parser';

class Block {
  constructor() {}
}

export default class Compiler {
  input: List;
  context: llvm.LLVMContext;
  module: llvm.Module;
  builder: llvm.IRBuilder;
  scope: Record<string, llvm.Value>;

  constructor(input: List) {
    this.input = input;
    this.context = new llvm.LLVMContext();
    this.module = new llvm.Module('top', this.context);
    this.builder = new llvm.IRBuilder(this.context);
    this.scope = {};
  }

  // TODO handle allocating strings (ConstantDataArray)
  emitSet(name, value) {
    const int8Type = llvm.Type.getInt8Ty(this.context);
    const doubleType = llvm.Type.getDoubleTy(this.context);
    const arraySize = llvm.ConstantInt.get(this.context, 1);
    const alloca = this.builder.createAlloca(doubleType, arraySize, name);
    const val = llvm.ConstantFP.get(this.context, value);
    const store = this.builder.createStore(val, alloca);
    const bitcast = this.builder.createBitCast(alloca, int8Type.getPointerTo());
    this.scope[name] = bitcast;
  }

  // TODO just put in env and call
  // TODO handle numbers
  emitEcho(name) {
    const putsFunc = this.module.getOrInsertFunction(
      'puts',
      llvm.FunctionType.get(
        llvm.Type.getInt64Ty(this.context),
        [llvm.Type.getInt8PtrTy(this.context)],
        false
      )
    );

    const arg = this.builder.createBitCast(
      this.scope[name],
      llvm.Type.getInt8PtrTy(this.context)
    );
    const call = this.builder.createCall(putsFunc.callee, [arg]);
  }

  build(input = this.input) {
    return input.map((list) => {
      const block = new Block();
      console.log({list});

      return block;
    });
  }

  run() {
    const blocks = this.build();
    console.log({blocks});

    const mainType = llvm.FunctionType.get(
      llvm.Type.getInt64Ty(this.context),
      [],
      false
    );
    const fn = llvm.Function.create(
      mainType,
      llvm.LinkageTypes.ExternalLinkage,
      'main',
      this.module
    );
    const block = llvm.BasicBlock.create(this.context, 'entry', fn);
    this.builder.setInsertionPoint(block);

    for (let i = 0; i < this.input.length; i++) {
      const list = this.input[i];
      if (list[0].value === 'set') {
        this.emitSet(list[1].value, list[2].value);
      }
      if (list[0].value === 'echo') {
        this.emitEcho(list[1].value);
      }
    }

    const zero = llvm.ConstantInt.get(this.context, 0, 64);
    this.builder.createRet(zero);

    const ll = this.module.print();
    console.log(ll);
    llvm.writeBitcodeToFile(this.module, 'out.ir');
  }
}
