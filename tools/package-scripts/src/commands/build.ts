import * as path from 'path';
import * as fs from 'fs-extra';
import {rollup} from 'rollup';
import {CommandModule} from 'yargs';
import {readConfigFile} from '../utilities/config';
import {createRollupConfig} from '../utilities/createRollupConfig';
import {
  getMainFile,
  getMainTypeFile,
  getModuleFile,
  getModuleTypeFile,
  getSourceFile,
  outDirectory,
} from '../utilities/paths';

const command: CommandModule = {
  command: 'build',
  builder: (argv) =>
    argv.strict().options({
      target: {
        require: true,
        choices: ['development', 'production'],
        description: 'Build target',
      },
    }),
  handler: async (argv) => {
    // cleanup first
    await fs.emptyDir(outDirectory);
    await fs.ensureDir(outDirectory);

    if (argv.target === 'development') {
      const config = await readConfigFile();
      await Promise.all(
        config.entrypoints.map(async (entrypoint) => {
          const mainFile = await getMainFile(entrypoint);
          if (mainFile) {
            await fs.writeFile(
              mainFile,
              // TODO: named or default?
              `
const register = require("@babel/register");
const revert = register({extensions: ['.ts', '.tsx']});
module.exports = require('${path.relative(
                path.dirname(mainFile),
                getSourceFile(entrypoint),
              )}');
revert()
`,
            );
          }
          const mainTypeFile = await getMainTypeFile(entrypoint);
          if (mainTypeFile) {
            await fs.writeFile(
              mainTypeFile,
              // TODO: named or default?
              `export * from "${path.relative(
                path.dirname(mainTypeFile),
                getSourceFile(entrypoint),
              )}";`,
            );
          }

          const moduleFile = await getModuleFile(entrypoint);
          if (moduleFile) {
            await fs.writeFile(
              moduleFile,
              // TODO: named or default?
              `export * from "${path.relative(
                path.dirname(moduleFile),
                getSourceFile(entrypoint),
              )}";`,
            );
          }
          const moduleTypeFile = await getModuleTypeFile(entrypoint);
          if (moduleTypeFile) {
            await fs.writeFile(
              moduleTypeFile,
              // TODO: named or default?
              `export * from "${path.relative(
                path.dirname(moduleTypeFile),
                getSourceFile(entrypoint),
              )}";`,
            );
          }
        }),
      );
    } else {
      const rollupConfigs = await createRollupConfig();
      await Promise.all(
        rollupConfigs.map(async (rollupConfig) => {
          const bundle = await rollup(rollupConfig.input);
          await Promise.all(
            rollupConfig.output.map((output) => bundle.write(output)),
          );
          await bundle.close();
        }),
      );
    }
  },
};

export default command;
