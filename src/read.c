#import "read.h"

val* val_read_num(val_state* state, mpc_ast_t* t) {
  errno = 0;
  long x = strtol(t->contents, NULL, 10);
  return errno != ERANGE ?
    val_num(state, x) :
    val_err(state, "Invalid Number.");
}

val* val_read_str(val_state* state, mpc_ast_t* t) {
  /* Cut off the final quote character */
  t->contents[strlen(t->contents)-1] = '\0';
  /* Copy the string missing out the first quote character */
  char* unescaped = malloc(strlen(t->contents+1)+1);
  strcpy(unescaped, t->contents+1);
  /* Pass through the unescape function */
  unescaped = mpcf_unescape(unescaped);
  /* Construct a new val using the string */
  val* str = val_str(state, unescaped);
  /* Free the string and return */
  free(unescaped);
  return str;
}

val* val_read(mpc_ast_t* t, char* filename) {
  val_state* state = val_state_create(
    filename,
    val_state_location(
      t->state.pos,
      t->state.row,
      t->state.col
    )
  );
  
  if (strstr(t->tag, "number")) { return val_read_num(state, t); }
  if (strstr(t->tag, "string")) { return val_read_str(state, t); }
  if (strstr(t->tag, "symbol")) { return val_sym(state, t->contents); }
  
  val* x = NULL;
  if (strcmp(t->tag, ">") == 0) { x = val_sexpr(state); } 
  if (strstr(t->tag, "sexpr"))  { x = val_sexpr(state); }
  if (strstr(t->tag, "qexpr"))  { x = val_qexpr(state); }
  
  for (int i = 0; i < t->children_num; i++) {
    if (strcmp(t->children[i]->contents, "[") == 0) { continue; }
    if (strcmp(t->children[i]->contents, "]") == 0) { continue; }
    if (strcmp(t->children[i]->contents, "{") == 0) { continue; }
    if (strcmp(t->children[i]->contents, "}") == 0) { continue; }
    if (strcmp(t->children[i]->tag,  "regex") == 0) { continue; }
    if (strstr(t->children[i]->tag, "comment")) { continue; }
    x = val_add(x, val_read(t->children[i], filename));
  }
  
  return x;
}
