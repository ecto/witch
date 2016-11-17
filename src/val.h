#ifndef VAL_BLOCK
#define VAL_BLOCK

struct val;
struct val_state;
typedef struct val val;
typedef struct val_state val_state;

#include "env.h"
#include "mpc.h"
#include "builtin.h"

struct val_state {
  char* filename;
  mpc_state_t* location;
};

struct val {
  int type;
  val_state* state;

  // basic
  long num;
  char* err;
  char* sym;
  char* str;

  // function
  builtin* builtin;
  env* env;
  val* formals;
  val* body;

  // expression
  int count;
  val** cell;
};

enum {
  VAL_ERR,
  VAL_NUM,
  VAL_SYM,
  VAL_STR,
  VAL_FUN,
  VAL_SEXPR,
  VAL_QEXPR
};

val* val_num(val_state* state, long x);
val* val_err(val_state* state, char* fmt, ...);
val* val_sym(val_state* state, char* s);
val* val_str(val_state* state, char* s);
val* val_builtin(val_state* state, builtin func);
val* val_lambda(val_state* state, val* formals, val* body);
val* val_sexpr(val_state* state);
val* val_qexpr(val_state* state);

void val_del(val* v);
val* val_copy(val* v);
val* val_add(val* v, val* x);
val* val_join(val* x, val* y);
val* val_pop(val* v, int i);
val* val_take(val* v, int i);

void val_print_expr(val* v, char open, char close);
void val_print_str(val* v);
void val_print_err(val* v);
void val_print(val* v);
void val_println(val* v);

int val_eq(val* x, val* y);
char* ltype_name(int t);

mpc_state_t* val_state_location(long pos, long row, long col);
val_state* val_state_create(char* filename, mpc_state_t* location);

#endif
