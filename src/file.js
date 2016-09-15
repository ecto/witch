const fs = require('fs');
const path = require('path');

function getScript() {
  if (process.argv.length === 2) {
    console.log('No script specified!');
    process.exit(1);
  }

  const scriptName = process.argv.pop();
  const scriptPath = path.resolve(__dirname, scriptName);

  try {
    const program = fs.readFileSync(scriptName).toString();
    return program;
  } catch (e) {
    console.log('Could not read input script');
    process.exit(1);
  }
}

module.exports = {
  getScript,
};
