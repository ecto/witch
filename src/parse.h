#include "mpc.h"
#include "env.h"
#include "val.h"
#include "read.h"

mpc_parser_t* Number;
mpc_parser_t* Symbol;
mpc_parser_t* String;
mpc_parser_t* Comment;
mpc_parser_t* Sexpr;
mpc_parser_t* Qexpr;
mpc_parser_t* Expr;
mpc_parser_t* Program;

void parser_init();
void parser_run_with_location(char* input, env* e, char* location);
void parser_run(char* input, env* e);
val* parser_load_file(val* a, env* e);
void parser_cleanup();
