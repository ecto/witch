#include "val.h"
#include "eval.h"
#include "parse.h"

#ifndef BUILTIN_BLOCK
#define BUILTIN_BLOCK

typedef val* (builtin) (env*, val*);

#define ASSERT(args, cond, fmt, ...) \
  if (!(cond)) { \
    val* err = val_err(val_state_create("builtin", val_state_location(0,0,0)), fmt, ##__VA_ARGS__); \
    val_del(args); \
    return err; \
  }

#define ASSERT_TYPE(func, args, index, expect) \
  ASSERT(args, args->cell[index]->type == expect, \
    "Function '%s' passed incorrect type for argument %i. Got %s, Expected %s.", \
    func, index, ltype_name(args->cell[index]->type), ltype_name(expect))

#define ASSERT_NUM(func, args, num) \
  ASSERT(args, args->count == num, \
    "Function '%s' passed incorrect number of arguments. Got %i, Expected %i.", \
    func, args->count, num)

#define ASSERT_NOT_EMPTY(func, args, index) \
  ASSERT(args, args->cell[index]->count != 0, \
    "Function '%s' passed {} for argument %i.", func, index);

val* builtin_lambda(env* e, val* a);
val* builtin_list(env* e, val* a);
val* builtin_head(env* e, val* a);
val* builtin_tail(env* e, val* a);
val* builtin_eval(env* e, val* a);
val* builtin_join(env* e, val* a);
val* builtin_op(env* e, val* a, char* op);
val* builtin_add(env* e, val* a);
val* builtin_sub(env* e, val* a);
val* builtin_mul(env* e, val* a);
val* builtin_div(env* e, val* a);
val* builtin_var(env* e, val* a, char* func);
val* builtin_def(env* e, val* a);
val* builtin_put(env* e, val* a);
val* builtin_ord(env* e, val* a, char* op);
val* builtin_gt(env* e, val* a);
val* builtin_lt(env* e, val* a);
val* builtin_ge(env* e, val* a);
val* builtin_le(env* e, val* a);
val* builtin_cmp(env* e, val* a, char* op);
val* builtin_eq(env* e, val* a);
val* builtin_ne(env* e, val* a);
val* builtin_if(env* e, val* a);
val* builtin_load(env* e, val* a);
val* builtin_print(env* e, val* a);
val* builtin_error(env* e, val* a);

void env_add_builtin(env* e, char* name, builtin func);
void env_add_builtins(env* e);

#endif
