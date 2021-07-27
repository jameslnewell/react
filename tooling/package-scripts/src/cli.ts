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
  .fail((message, error, yargs) => {
    if (error) {
      console.error();
      console.error('  🚨', error?.message ? error.message : error);
      console.error();
    } else {
      console.error(yargs.help());
      console.log();
      console.log(message);
    }
    process.exit(-1);
  })
  .parse();
