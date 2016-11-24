all:
	@cc -std=c99 -Wall \
    src/builtin.c \
    src/env.c \
    src/eval.c \
    src/mpc.c \
    src/parse.c \
    src/read.c \
    src/val.c \
    src/witch.c \
    -ledit \
		-lm \
		-o witch \

wasm:
	LLVM=/Users/ecto/code/emscripten-fastcomp/build/bin \
	../../emscripten/emcc \
	src/builtin.c \
	src/env.c \
	src/eval.c \
	src/mpc.c \
	src/parse.c \
	src/read.c \
	src/val.c \
	src/witch.c \
	-s WASM=1 \
	-s "BINARYEN_METHOD='interpret-binary'"

#EMCC_WASM_BACKEND=1 \
