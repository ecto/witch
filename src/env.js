class Env {
  constructor(params = {}, parent) {
    this.params = params;
    this.parent = parent;
  }

  set(name, value) {
    // can be at any parent in the tree
    const instance = this.find(name) || this;
    instance.params[name] = value;

    // we need to return something here,
    // because some special functions return
    // this return value. if we return undefined,
    // it ends up being interpreted as a
    // function call on undefined
    return null;
  }

  update(params) {
    Object.keys(params).forEach((name, i) => {
      this.set(name, params[i])
    });
  }

  get(name) {
    const env = this.find(name);

    if (!env) {
      return undefined;
    }

    return env.params[name];
  }

  find(name) {
    if (this.params[name]) {
      return this;
    }

    return this.parent &&
      this.parent.find(name);
  }
}

module.exports = Env;
