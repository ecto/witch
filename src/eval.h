#include "val.h"
#include "env.h"

val* val_call(env* e, val* f, val* a);
val* val_eval_sexpr(env* e, val* v);
val* val_eval(env* e, val* v);
