import {Command} from 'commander';
import Parser from './parser';
import Compiler from './compiler';

const fs = require('fs');
const path = require('path');
const {version} = require('../package.json');

const program = new Command();
program.version(version);

program
  .command('run [source]')
  .description('run a witch program')
  .action((source) => {
    const absolutePath = path.resolve(process.cwd(), source);
    const text = fs.readFileSync(absolutePath).toString();

    const parser = new Parser(text);
    const nodes = parser.run();

    const compiler = new Compiler(nodes);
    const out = compiler.run();
  });

program.parse(process.argv);
