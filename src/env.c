#import "env.h"

env* env_new(void) {
  env* e = malloc(sizeof(env));
  e->par = NULL;
  e->count = 0;
  e->syms = NULL;
  e->vals = NULL;
  return e;
}

void env_del(env* e) {
  for (int i = 0; i < e->count; i++) {
    free(e->syms[i]);
    val_del(e->vals[i]);
  }

  free(e->syms);
  free(e->vals);
  free(e);
}

env* env_copy(env* e) {
  env* n = malloc(sizeof(env));
  n->par = e->par;
  n->count = e->count;
  n->syms = malloc(sizeof(char*) * n->count);
  n->vals = malloc(sizeof(val*) * n->count);

  for (int i = 0; i < e->count; i++) {
    n->syms[i] = malloc(strlen(e->syms[i]) + 1);
    strcpy(n->syms[i], e->syms[i]);
    n->vals[i] = val_copy(e->vals[i]);
  }

  return n;
}

val* env_get(env* e, val* k) {
  for (int i = 0; i < e->count; i++) {
    if (strcmp(e->syms[i], k->sym) == 0) {
      return val_copy(e->vals[i]);
    }
  }

  if (e->par) {
    return env_get(e->par, k);
  }

  return val_err(k->state, "Unbound Symbol '%s'", k->sym);
}

void env_put(env* e, val* k, val* v) {
  for (int i = 0; i < e->count; i++) {
    if (strcmp(e->syms[i], k->sym) == 0) {
      val_del(e->vals[i]);
      e->vals[i] = val_copy(v);
      return;
    }
  }

  e->count++;
  e->vals = realloc(e->vals, sizeof(val*) * e->count);
  e->syms = realloc(e->syms, sizeof(char*) * e->count);
  e->vals[e->count-1] = val_copy(v);
  e->syms[e->count-1] = malloc(strlen(k->sym)+1);
  strcpy(e->syms[e->count-1], k->sym);
}

void env_def(env* e, val* k, val* v) {
  while (e->par) {
    e = e->par;
  }

  env_put(e, k, v);
}
