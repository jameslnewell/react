import {CommandModule} from 'yargs';
import {passthru} from '../utilities/passthru';
import {resolveBin} from '../utilities/resolveBin';

const command: CommandModule = {
  command: 'check',
  builder: (argv) =>
    argv.strict().options({
      watch: {
        boolean: true,
        description: 'Re-build the package when files change',
      },
    }),
  handler: async (argv) => {
    // TODO: check for tsconfig file

    const args: string[] = ['--noEmit', '--project', 'tsconfig.json'];
    if (argv.watch) {
      args.push('--watch');
    }
    await passthru(await resolveBin('typescript', {executable: 'tsc'}), args);
  },
};

export default command;
