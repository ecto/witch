#include "val.h"

val* val_read_num(val_state* state, mpc_ast_t* t);
val* val_read_str(val_state* state, mpc_ast_t* t);
val* val_read(mpc_ast_t* t, char* filename);
