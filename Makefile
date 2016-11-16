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
