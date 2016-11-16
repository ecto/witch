#import "parse.h"

void parser_init() {
  Number = mpc_new("number");
  Symbol = mpc_new("symbol");
  String = mpc_new("string");
  Comment = mpc_new("comment");
  Sexpr = mpc_new("sexpr");
  Qexpr = mpc_new("qexpr");
  Expr = mpc_new("expr");
  Program = mpc_new("program");

  mpca_lang(
    MPCA_LANG_DEFAULT,
    "                                              \
      number  : /-?[0-9]+/ ;                       \
      symbol  : /[a-zA-Z0-9_+\\-*\\/\\\\=<>!&]+/ ; \
      string  : /\"(\\\\.|[^\"])*\"/ ;             \
      comment : /;[^\\r\\n]*/ ;                    \
      sexpr   : '(' <expr>* ')' ;                  \
      qexpr   : '{' <expr>* '}' ;                  \
      expr    : <number>  | <symbol> | <string>    \
              | <comment> | <sexpr>  | <qexpr>;    \
      program : /^/ <expr>* /$/ ;                  \
    ",
    Number,
    Symbol,
    String,
    Comment,
    Sexpr,
    Qexpr,
    Expr,
    Program
  );
}

void parser_run(char* input, env* e) {
  mpc_result_t r;

  if (mpc_parse("<stdin>", input, Program, &r)) {
    val* x = val_eval(e, val_read(r.output, "repl"));
    val_println(x);
    val_del(x);
    mpc_ast_delete(r.output);
  } else {
    mpc_err_print(r.error);
    mpc_err_delete(r.error);
  }
}

val* parser_load_file(val* a, env* e) {
  mpc_result_t r;

  if (!mpc_parse_contents(a->cell[0]->str, Program, &r)) {
    char* err_msg = mpc_err_string(r.error);
    mpc_err_delete(r.error);
    val* err = val_err(a->state, "Could not load library\n%s", err_msg);
    free(err_msg);
    val_del(a);
    return err;
  }

  val* expr = val_read(r.output, a->cell[0]->str);
  mpc_ast_delete(r.output);

  while (expr->count) {
    val* x = val_eval(e, val_pop(expr, 0));

    if (x->type == VAL_ERR) {
      val_println(x);
    }

    val_del(x);
  }

  val_del(expr);
  val_del(a);
  // TODO create new state with filename?
  return val_sexpr(expr->state);
}

void parser_cleanup() {
  mpc_cleanup(
    8,
    Number,
    Symbol,
    String,
    Comment,
    Sexpr,
    Qexpr,
    Expr,
    Program
  );
}
