import * as fs from 'fs-extra';
import {rollup} from 'rollup';
import {CommandModule} from 'yargs';
import {createRollupConfig} from '../utilities/createRollupConfig';
import {outDirectory} from '../utilities/paths';

const command: CommandModule = {
  command: 'build',
  handler: async () => {
    // cleanup first
    await fs.emptyDir(outDirectory);
    await fs.ensureDir(outDirectory);

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
  },
};

export default command;
