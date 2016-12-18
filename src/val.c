#import "val.h"

val* val_num(val_state* state, double x) {
  val* v = malloc(sizeof(val));
  v->type = VAL_NUM;
  v->state = state;
  v->num = x;
  return v;
}

val* val_err(val_state* state, char* fmt, ...) {
  val* v = malloc(sizeof(val));
  v->type = VAL_ERR;
  v->state = state;

  va_list va;
  va_start(va, fmt);
  v->err = malloc(512);
  vsnprintf(v->err, 511, fmt, va);
  v->err = realloc(v->err, strlen(v->err)+1);
  va_end(va);

  return v;
}

val* val_sym(val_state* state, char* s) {
  val* v = malloc(sizeof(val));
  v->type = VAL_SYM;
  v->state = state;
  v->sym = malloc(strlen(s) + 1);
  strcpy(v->sym, s);
  return v;
}

val* val_str(val_state* state, char* s) {
  val* v = malloc(sizeof(val));
  v->type = VAL_STR;
  v->state = state;
  v->str = malloc(strlen(s) + 1);
  strcpy(v->str, s);
  return v;
}

val* val_builtin(val_state* state, builtin func) {
  val* v = malloc(sizeof(val));
  v->type = VAL_FUN;
  v->state = state;
  v->builtin = func;
  return v;
}

val* val_lambda(val_state* state, val* formals, val* body) {
  val* v = malloc(sizeof(val));
  v->type = VAL_FUN;
  v->state = state;
  v->builtin = NULL;
  v->env = env_new();
  v->formals = formals;
  v->body = body;
  return v;
}

val* val_sexpr(val_state* state) {
  val* v = malloc(sizeof(val));
  v->type = VAL_SEXPR;
  v->state = state;
  v->count = 0;
  v->cell = NULL;
  return v;
}

val* val_qexpr(val_state* state) {
  val* v = malloc(sizeof(val));
  v->type = VAL_QEXPR;
  v->state = state;
  v->count = 0;
  v->cell = NULL;
  return v;
}

void val_del(val* v) {
  switch (v->type) {
    case VAL_NUM:
      break;
    case VAL_FUN:
      if (!v->builtin) {
        env_del(v->env);
        val_del(v->formals);
        val_del(v->body);
      }
      break;
    case VAL_ERR:
      free(v->err);
      break;
    case VAL_SYM:
      free(v->sym);
      break;
    case VAL_STR:
      free(v->str);
      break;
    case VAL_QEXPR:
    case VAL_SEXPR:
      for (int i = 0; i < v->count; i++) {
        val_del(v->cell[i]);
      }
      free(v->cell);
      break;
  }

  free(v);
}

val* val_copy(val* v) {
  val* x = malloc(sizeof(val));
  x->type = v->type;
  x->state = v->state;

  switch (v->type) {
    case VAL_FUN:
      if (v->builtin) {
        x->builtin = v->builtin;
      } else {
        x->builtin = NULL;
        x->env = env_copy(v->env);
        x->formals = val_copy(v->formals);
        x->body = val_copy(v->body);
      }
      break;
    case VAL_NUM:
      x->num = v->num;
      break;
    case VAL_ERR:
      x->err = malloc(strlen(v->err) + 1);
      strcpy(x->err, v->err);
      break;
    case VAL_SYM:
      x->sym = malloc(strlen(v->sym) + 1);
      strcpy(x->sym, v->sym);
      break;
    case VAL_STR:
      x->str = malloc(strlen(v->str) + 1);
      strcpy(x->str, v->str);
    break;
    case VAL_SEXPR:
    case VAL_QEXPR:
      x->count = v->count;
      x->cell = malloc(sizeof(val*) * x->count);
      for (int i = 0; i < x->count; i++) {
        x->cell[i] = val_copy(v->cell[i]);
      }
      break;
  }
  return x;
}

val* val_add(val* v, val* x) {
  v->count++;
  v->cell = realloc(v->cell, sizeof(val*) * v->count);
  v->cell[v->count-1] = x;
  return v;
}

val* val_join(val* x, val* y) {
  for (int i = 0; i < y->count; i++) {
    x = val_add(x, y->cell[i]);
  }

  free(y->cell);
  free(y);
  return x;
}

val* val_pop(val* v, int i) {
  val* x = v->cell[i];
  memmove(
    &v->cell[i],
    &v->cell[i+1],
    sizeof(val*) * (v->count-i-1)
  );
  v->count--;
  v->cell = realloc(v->cell, sizeof(val*) * v->count);
  return x;
}

val* val_take(val* v, int i) {
  val* x = val_pop(v, i);
  val_del(v);
  return x;
}

void val_print_expr(val* v, char open, char close) {
  putchar(open);

  for (int i = 0; i < v->count; i++) {
    val_print(v->cell[i]);

    if (i != (v->count-1)) {
      putchar(' ');
    }
  }

  putchar(close);
}

void val_print_str(val* v) {
  char* escaped = malloc(strlen(v->str)+1);
  strcpy(escaped, v->str);
  escaped = mpcf_escape(escaped);
  printf("%s", escaped);
  free(escaped);
}

void val_print_err(val* v) {
  printf("Error in %s:", v->state->filename);
  printf("%ld:", v->state->location->row);
  printf("%ld:\n", v->state->location->col);
  printf("  %s", v->err);
  //printf("pos: %ld\n", v->state->location->pos);
}

void val_print(val* v) {
  switch (v->type) {
    case VAL_FUN:
      if (v->builtin) {
        printf("<builtin>");
      } else {
        printf("[fn ");
        val_print(v->formals);
        putchar(' ');
        val_print(v->body);
        putchar(']');
      }
      break;
    case VAL_NUM:
      printf("%.5lf!", v->num);
      break;
    case VAL_ERR:
      val_print_err(v);
      break;
    case VAL_SYM:
      printf("%s", v->sym);
      break;
    case VAL_STR:
      val_print_str(v);
      break;
    case VAL_SEXPR:
      val_print_expr(v, '[', ']');
      break;
    case VAL_QEXPR:
      val_print_expr(v, '{', '}');
      break;
  }
}

void val_println(val* v) {
  val_print(v);
  putchar('\n');
}

int val_eq(val* x, val* y) {
  if (x->type != y->type) {
    return 0;
  }

  switch (x->type) {
    case VAL_NUM:
      return (x->num == y->num);
    case VAL_ERR:
      return (strcmp(x->err, y->err) == 0);
    case VAL_SYM:
      return (strcmp(x->sym, y->sym) == 0);
    case VAL_STR:
      return (strcmp(x->str, y->str) == 0);
    case VAL_FUN:
      if (x->builtin || y->builtin) {
        return x->builtin == y->builtin;
      }

      return val_eq(x->formals, y->formals) && val_eq(x->body, y->body);
    case VAL_QEXPR:
    case VAL_SEXPR:
      if (x->count != y->count) {
        return 0;
      }

      for (int i = 0; i < x->count; i++) {
        if (!val_eq(x->cell[i], y->cell[i])) {
          return 0;
        }
      }

      return 1;
    break;
  }

  return 0;
}

char* ltype_name(int t) {
  switch (t) {
    case VAL_FUN:
      return "Function";
    case VAL_NUM:
      return "Number";
    case VAL_ERR:
      return "Error";
    case VAL_SYM:
      return "Symbol";
    case VAL_STR:
      return "String";
    case VAL_SEXPR:
      return "S-Expression";
    case VAL_QEXPR:
      return "Q-Expression";
    default:
      return "Unknown";
  }
}

mpc_state_t* val_state_location(long pos, long row, long col) {
  mpc_state_t* location = malloc(sizeof(mpc_state_t));
  location->pos = pos;
  location->row = row;
  location->col = col;
  return location;
}

val_state* val_state_create(char* filename, mpc_state_t* location) {
  val_state* state = malloc(sizeof(val_state));
  state->filename = filename;
  state->location = location;
  return state;
}
