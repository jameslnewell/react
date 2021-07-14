import * as path from 'path';
import * as fs from 'fs-extra';
import {CommandModule} from 'yargs';
import {readConfigFile} from '../utilities/config';
import {
  getMainFile,
  getMainTypeFile,
  getModuleFile,
  getModuleTypeFile,
  getSourceFile,
  outDirectory,
} from '../utilities/paths';

const command: CommandModule = {
  command: 'setup',
  handler: async () => {
    // cleanup first
    await fs.emptyDir(outDirectory);
    await fs.ensureDir(outDirectory);

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
  },
};

export default command;
