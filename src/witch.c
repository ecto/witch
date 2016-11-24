#include <stdio.h>
#include <stdlib.h>
//#include <editline/readline.h>

#include "val.h"
#include "builtin.h"
#include "env.h"
#include "eval.h"
#include "parse.h"
#include "read.h"

int main(int argc, char** argv) {
  parser_init();

  env* e = env_new();
  env_add_builtins(e);

/*
  // emscripten doesn't like editline
  if (argc == 1) {
    puts("Witch Version 0.0.0.1.0");
    puts("Press Ctrl+c to Exit\n");

    while (1) {
      char* input = readline("witch> ");
      add_history(input);
      parser_run(input, e);
      free(input);
    }
  }
*/

  if (argc >= 2) {
    for (int i = 1; i < argc; i++) {
      val_state* state = val_state_create("main", val_state_location(0, 0, 0));
      val* args = val_add(val_sexpr(state), val_str(state, argv[i]));
      val* x = builtin_load(e, args);

      if (x->type == VAL_ERR) {
        val_println(x);
        return 1;
      }

      val_del(x);
    }
  }

  env_del(e);

  parser_cleanup();

  return 0;
}
