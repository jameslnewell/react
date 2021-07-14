import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

yargs(hideBin(process.argv))
  .strict()
  .help()
  .demandCommand()
  .commandDir('commands', {
    extensions: ['ts'],
    visit: (commandModule) => commandModule.default,
  })
  .parse();
