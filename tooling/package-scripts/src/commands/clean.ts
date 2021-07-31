import * as fs from 'fs-extra';
import {CommandModule} from 'yargs';
import {outDirectory} from '../utilities/paths';

const command: CommandModule = {
  command: 'clean',
  builder: (argv) => argv.strict(),
  handler: async () => {
    await fs.remove(outDirectory);
  },
};

export default command;
