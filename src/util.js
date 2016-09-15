const Env = require('./env');

function standardEnv() {
  var env = new Env();

  env.set('bar', 'baz');
  env.set('log', (...args) => {
    console.log.apply(undefined, args);
    return null;
  });

  return env;
}

module.exports = {
  standardEnv,
};
