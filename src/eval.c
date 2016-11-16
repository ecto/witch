#import "eval.h"

val* val_call(env* e, val* f, val* a) {
  if (f->builtin) {
    return f->builtin(e, a);
  }
  
  int given = a->count;
  int total = f->formals->count;
  
  while (a->count) {
    if (f->formals->count == 0) {
      val_del(a);
      return val_err(
        a->state,
        "Function passed too many arguments. "
        "Got %i, Expected %i.",
        given,
        total
      ); 
    }
    
    val* sym = val_pop(f->formals, 0);
    
    if (strcmp(sym->sym, "&") == 0) {
      if (f->formals->count != 1) {
        val_del(a);
        return val_err(
          a->state,
          "Function format invalid. "
          "Symbol '&' not followed by single symbol."
        );
      }
      
      val* nsym = val_pop(f->formals, 0);
      env_put(f->env, nsym, builtin_list(e, a));
      val_del(sym);
      val_del(nsym);
      break;
    }
    
    val* val = val_pop(a, 0);    
    env_put(f->env, sym, val);    
    val_del(sym); val_del(val);
  }
  
  val_del(a);
  
  if (
    f->formals->count > 0 &&
    strcmp(f->formals->cell[0]->sym, "&") == 0
  ) {
    
    if (f->formals->count != 2) {
      return val_err(
        f->state,
        "Function format invalid. "
        "Symbol '&' not followed by single symbol."
      );
    }
    
    val_del(val_pop(f->formals, 0));
    
    val* sym = val_pop(f->formals, 0);
    val* val = val_qexpr(f->state);
    env_put(f->env, sym, val);
    val_del(sym);
    val_del(val);
  }
  
  if (f->formals->count == 0) {  
    f->env->par = e;    

    return builtin_eval(
      f->env,
      val_add(
        val_sexpr(f->state),
        val_copy(f->body)
      )
    );
  }

  return val_copy(f);
}

val* val_eval_sexpr(env* e, val* v) {
  for (int i = 0; i < v->count; i++) {
    v->cell[i] = val_eval(e, v->cell[i]);

    if (v->cell[i]->type == VAL_ERR) {
      return val_take(v, i);
    }
  }

  if (v->count == 0) {
    return v;
  }

  if (v->count == 1) {
    return val_eval(e, val_take(v, 0));
  }
  
  val* f = val_pop(v, 0);
  if (f->type != VAL_FUN) {
    val* err = val_err(
      f->state,
      "S-Expression starts with incorrect type. "
      "Got %s, Expected %s.",
      ltype_name(f->type),
      ltype_name(VAL_FUN)
    );
    val_del(f);
    val_del(v);
    return err;
  }
  
  val* result = val_call(e, f, v);
  val_del(f);
  return result;
}

val* val_eval(env* e, val* v) {
  if (v->type == VAL_SYM) {
    val* x = env_get(e, v);
    val_del(v);
    return x;
  }

  if (v->type == VAL_SEXPR) {
    return val_eval_sexpr(e, v);
  }

  return v;
}
