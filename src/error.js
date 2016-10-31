const chalk = require('chalk');

// in order to provide easy-to-grok errors,
// we need to provide context for the errors.
// panic accepts a message, but also accepts a token
// parameter. token parameters will include the script
// name and position in script that the token came from,
// for highlighting purposes. the ErrorHandler class
// shouldn't have to know anything about the loaded files,
// but should be able to reach into them to retreive
// the code around the token for display to the user.
// so even though ErrorHandler only has one function,
// we need to turn it into a class so we can use
// dependency injection at a higher level

class ErrorHandler {
  constuctor() {

  }

  panic(token, message) {
    console.log(chalk.red(message));
    console.log(); // newline

    console.log(token);

    // TODO won't work in browser!
    // for this to work, we have to throw a special
    // error and catch it at the level where
    // we are executing code
    process.exit(1);
  }
}

const ERRORS = {
  UNDEFINED: 'The script tried to call a function that hasn\'t been defined yet!',
  SELF_IMPORT: 'Script cannot import itself',
};

module.exports = {
  ErrorHandler,
  ERRORS,
};
