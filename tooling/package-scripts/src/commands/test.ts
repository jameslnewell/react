import {CommandModule} from 'yargs';
import {createJestConfig} from '../utilities/createJestConfig';

import {passthru} from '../utilities/passthru';
import {resolveBin} from '../utilities/resolveBin';

const command: CommandModule = {
  command: 'test',
  builder: (argv) =>
    argv.options({
      debug: {
        boolean: true,
        description: 'Start the debugger',
      },
      watch: {
        default: true,
        boolean: true,
        description: 'Rerun tests when files change',
      },
    }),
  handler: async (argv) => {
    const args = [
      '--passWithNoTests',
      '--config',
      JSON.stringify(createJestConfig()),
    ];

    if (!process.env.CI && argv.watch) {
      args.push('--watch');
    }

    if (argv.debug) {
      args.push('--runInBand');
    }

    // pass through additional arguments
    args.push(...argv._.slice(1).map((s) => String(s)));

    await passthru(await resolveBin('jest'), args, {});
  },
};

export default command;
