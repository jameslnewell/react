import * as path from 'path';
import {readJSON} from 'fs-extra';
import {CommandModule} from 'yargs';
import {readConfigFile} from '../utilities/config';
import {passthru} from '../utilities/passthru';
import {
  getMainFile,
  getModuleFile,
  getPackageFile,
  rootDirectory,
} from '../utilities/paths';
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
    // TODO: check package.jsons have the correct paths

    const config = await readConfigFile();
    await Promise.all(
      config.entrypoints.map(async (entrypoint) => {
        const packageFile = getPackageFile(entrypoint);
        const mainFile = path.relative(
          path.dirname(packageFile),
          getMainFile(entrypoint),
        );
        const moduleFile = path.relative(
          path.dirname(packageFile),
          getModuleFile(entrypoint),
        );
        const pkg = await readJSON(packageFile);
        if (pkg.main !== mainFile) {
          throw new Error(
            `${path.relative(
              rootDirectory,
              packageFile,
            )}'s "main" field should be "${mainFile}"`,
          );
        }
        if (pkg.module !== moduleFile) {
          throw new Error(
            `${path.relative(
              rootDirectory,
              packageFile,
            )}'s "main" field should be "${moduleFile}"`,
          );
        }
        if (pkg.types !== undefined || pkg.typings !== undefined) {
          throw new Error(
            `${path.relative(
              rootDirectory,
              packageFile,
            )}'s "types" and "typings" fields should not be specified`,
          );
        }
      }),
    );

    const args: string[] = ['--noEmit', '--project', 'tsconfig.json'];
    if (argv.watch) {
      args.push('--watch');
    }
    await passthru(await resolveBin('typescript', {executable: 'tsc'}), args);
  },
};

export default command;
