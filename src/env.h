#ifndef ENV_BLOCK
#define ENV_BLOCK

struct env;
typedef struct env env;

#include "val.h"

struct env {
  env* par;
  int count;
  char** syms;
  val** vals;
};

env* env_new(void);
void env_del(env* e);
env* env_copy(env* e);
val* env_get(env* e, val* k);
void env_put(env* e, val* k, val* v);
void env_def(env* e, val* k, val* v);

#endif
