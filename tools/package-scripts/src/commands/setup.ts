import * as path from 'path';
import * as fs from 'fs-extra';
import {CommandModule} from 'yargs';
import {readConfigFile} from '../utilities/config';
import {
  getMainFile,
  getTypeFile,
  getModuleFile,
  getSourceFile,
  outDirectory,
  removeExtension,
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
            `export * from "${path.relative(
              path.dirname(mainFile),
              removeExtension(getSourceFile(entrypoint)),
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
              removeExtension(getSourceFile(entrypoint)),
            )}";`,
          );
        }

        const typeFile = await getTypeFile(entrypoint);
        if (typeFile) {
          await fs.writeFile(
            typeFile,
            // TODO: named or default?
            `export * from "${path.relative(
              path.dirname(typeFile),
              removeExtension(getSourceFile(entrypoint)),
            )}";`,
          );
        }
      }),
    );
  },
};

export default command;
