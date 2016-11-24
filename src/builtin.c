#include "builtin.h"

val* builtin_lambda(env* e, val* a) {
  ASSERT_NUM("fn", a, 2);
  ASSERT_TYPE("fn", a, 0, VAL_QEXPR);
  ASSERT_TYPE("fn", a, 1, VAL_QEXPR);

  for (int i = 0; i < a->cell[0]->count; i++) {
    ASSERT(a, (a->cell[0]->cell[i]->type == VAL_SYM),
      "Cannot define non-symbol. Got %s, Expected %s.",
      ltype_name(a->cell[0]->cell[i]->type), ltype_name(VAL_SYM));
  }

  val* formals = val_pop(a, 0);
  val* body = val_pop(a, 0);
  val_del(a);

  return val_lambda(a->state, formals, body);
}

val* builtin_list(env* e, val* a) {
  a->type = VAL_QEXPR;
  return a;
}

val* builtin_head(env* e, val* a) {
  ASSERT_NUM("head", a, 1);
  ASSERT_TYPE("head", a, 0, VAL_QEXPR);
  ASSERT_NOT_EMPTY("head", a, 0);

  val* v = val_take(a, 0);
  while (v->count > 1) { val_del(val_pop(v, 1)); }
  return v;
}

val* builtin_tail(env* e, val* a) {
  ASSERT_NUM("tail", a, 1);
  ASSERT_TYPE("tail", a, 0, VAL_QEXPR);
  ASSERT_NOT_EMPTY("tail", a, 0);

  val* v = val_take(a, 0);
  val_del(val_pop(v, 0));
  return v;
}

val* builtin_eval(env* e, val* a) {
  ASSERT_NUM("eval", a, 1);
  ASSERT_TYPE("eval", a, 0, VAL_QEXPR);

  val* x = val_take(a, 0);
  x->type = VAL_SEXPR;
  return val_eval(e, x);
}

val* builtin_join(env* e, val* a) {
  for (int i = 0; i < a->count; i++) {
    ASSERT_TYPE("join", a, i, VAL_QEXPR);
  }

  val* x = val_pop(a, 0);

  while (a->count) {
    val* y = val_pop(a, 0);
    x = val_join(x, y);
  }

  val_del(a);
  return x;
}

val* builtin_op(env* e, val* a, char* op) {
  for (int i = 0; i < a->count; i++) {
    ASSERT_TYPE(op, a, i, VAL_NUM);
  }

  val* x = val_pop(a, 0);

  if (
    (strcmp(op, "-") == 0) &&
    a->count == 0
  ) {
    x->num = -x->num;
  }

  while (a->count > 0) {
    val* y = val_pop(a, 0);

    if (strcmp(op, "+") == 0) {
      x->num += y->num;
    }

    if (strcmp(op, "-") == 0) {
      x->num -= y->num;
    }

    if (strcmp(op, "*") == 0) {
      x->num *= y->num;
    }

    if (strcmp(op, "/") == 0) {
      if (y->num == 0) {
        val_del(x);
        val_del(y);
        x = val_err(a->state, "Division By Zero.");
        break;
      }

      x->num /= y->num;
    }

    val_del(y);
  }

  val_del(a);
  return x;
}

val* builtin_add(env* e, val* a) {
  return builtin_op(e, a, "+");
}

val* builtin_sub(env* e, val* a) {
  return builtin_op(e, a, "-");
}

val* builtin_mul(env* e, val* a) {
  return builtin_op(e, a, "*");
}

val* builtin_div(env* e, val* a) {
  return builtin_op(e, a, "/");
}

val* builtin_var(env* e, val* a, char* func) {
  ASSERT_TYPE(func, a, 0, VAL_QEXPR);

  val* syms = a->cell[0];
  for (int i = 0; i < syms->count; i++) {
    ASSERT(a, (syms->cell[i]->type == VAL_SYM),
      "Function '%s' cannot define non-symbol. "
      "Got %s, Expected %s.",
      func, ltype_name(syms->cell[i]->type), ltype_name(VAL_SYM));
  }

  ASSERT(a, (syms->count == a->count-1),
    "Function '%s' passed too many arguments for symbols. "
    "Got %i, Expected %i.",
    func, syms->count, a->count-1);

  for (int i = 0; i < syms->count; i++) {
    if (strcmp(func, "def") == 0) {
      env_def(e, syms->cell[i], a->cell[i+1]);
    }

    if (strcmp(func, "=") == 0) {
      env_put(e, syms->cell[i], a->cell[i+1]);
    }
  }

  val_del(a);
  return val_sexpr(a->state);
}

val* builtin_def(env* e, val* a) {
  return builtin_var(e, a, "def");
}

val* builtin_put(env* e, val* a) {
  return builtin_var(e, a, "=");
}

val* builtin_ord(env* e, val* a, char* op) {
  ASSERT_NUM(op, a, 2);
  ASSERT_TYPE(op, a, 0, VAL_NUM);
  ASSERT_TYPE(op, a, 1, VAL_NUM);

  int r;
  if (strcmp(op, ">") == 0) {
    r = (a->cell[0]->num >  a->cell[1]->num);
  }

  if (strcmp(op, "<")  == 0) {
    r = (a->cell[0]->num <  a->cell[1]->num);
  }

  if (strcmp(op, ">=") == 0) {
    r = (a->cell[0]->num >= a->cell[1]->num);
  }

  if (strcmp(op, "<=") == 0) {
    r = (a->cell[0]->num <= a->cell[1]->num);
  }

  val_del(a);
  return val_num(a->state, r);
}

val* builtin_gt(env* e, val* a) {
  return builtin_ord(e, a, ">");
}

val* builtin_lt(env* e, val* a) {
  return builtin_ord(e, a, "<");
}

val* builtin_ge(env* e, val* a) {
  return builtin_ord(e, a, ">=");
}

val* builtin_le(env* e, val* a) {
  return builtin_ord(e, a, "<=");
}

val* builtin_cmp(env* e, val* a, char* op) {
  ASSERT_NUM(op, a, 2);
  int r;
  if (strcmp(op, "==") == 0) {
    r = val_eq(a->cell[0], a->cell[1]);
  }

  if (strcmp(op, "!=") == 0) {
    r = !val_eq(a->cell[0], a->cell[1]);
  }

  val_del(a);
  return val_num(a->state, r);
}

val* builtin_eq(env* e, val* a) {
  return builtin_cmp(e, a, "==");
}

val* builtin_ne(env* e, val* a) {
  return builtin_cmp(e, a, "!=");
}

val* builtin_if(env* e, val* a) {
  ASSERT_NUM("if", a, 3);
  ASSERT_TYPE("if", a, 0, VAL_NUM);
  ASSERT_TYPE("if", a, 1, VAL_QEXPR);
  ASSERT_TYPE("if", a, 2, VAL_QEXPR);

  val* x;
  a->cell[1]->type = VAL_SEXPR;
  a->cell[2]->type = VAL_SEXPR;

  if (a->cell[0]->num) {
    x = val_eval(e, val_pop(a, 1));
  } else {
    x = val_eval(e, val_pop(a, 2));
  }

  val_del(a);
  return x;
}

val* builtin_load(env* e, val* a) {
  ASSERT_NUM("load", a, 1);
  ASSERT_TYPE("load", a, 0, VAL_STR);

  return parser_load_file(a, e);
}

val* builtin_print(env* e, val* a) {
  // Print each argument followed by a space
  for (int i = 0; i < a->count; i++) {
    val_print(a->cell[i]); putchar(' ');
  }

  // print a newline and delete arguments
  putchar('\n');
  val_del(a);

  return val_sexpr(a->state);
}

val* builtin_error(env* e, val* a) {
  ASSERT_NUM("error", a, 1);
  ASSERT_TYPE("error", a, 0, VAL_STR);

  // construct error from first argument
  val* err = val_err(a->state, a->cell[0]->str);

  // delete arguments and return
  val_del(a);
  return err;
}

void env_add_builtin(env* e, char* name, builtin func) {
  val_state* state = malloc(sizeof(val_state));
  state->filename = "<builtin>";
  val* k = val_sym(state, name);
  val* v = val_builtin(state, func);
  env_put(e, k, v);
  val_del(k);
  val_del(v);
}

void env_add_builtins(env* e) {
  // variables
  env_add_builtin(e, "fn",  builtin_lambda);
// not sure if i want to allow globals
//  env_add_builtin(e, "def", builtin_def);
  env_add_builtin(e, "=",   builtin_put);

  // lists
  env_add_builtin(e, "list", builtin_list);
  env_add_builtin(e, "head", builtin_head);
  env_add_builtin(e, "tail", builtin_tail);
  env_add_builtin(e, "eval", builtin_eval);
  env_add_builtin(e, "join", builtin_join);

  // math
  env_add_builtin(e, "+", builtin_add);
  env_add_builtin(e, "-", builtin_sub);
  env_add_builtin(e, "*", builtin_mul);
  env_add_builtin(e, "/", builtin_div);

  // comparisons
  env_add_builtin(e, "if", builtin_if);
  env_add_builtin(e, "=?", builtin_eq);
  env_add_builtin(e, "!=?", builtin_ne);
  env_add_builtin(e, ">?",  builtin_gt);
  env_add_builtin(e, "<?",  builtin_lt);
  env_add_builtin(e, ">=?", builtin_ge);
  env_add_builtin(e, "<=?", builtin_le);

  // strings
  env_add_builtin(e, "load",  builtin_load);
  env_add_builtin(e, "error", builtin_error);
  env_add_builtin(e, "print", builtin_print);
}
