import {InputOptions, OutputOptions, Plugin, PluginContext} from 'rollup';
import * as child_process from 'child_process';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeExternals from 'rollup-plugin-node-externals';
import nodeResolve from '@rollup/plugin-node-resolve';
import {createBabelConfigForRollup} from './createBabelConfig';
import {
  getMainFile,
  getModuleFile,
  getSourceFile,
  outDirectory,
  rootDirectory,
} from './paths';
import {promisify} from 'util';
import {readConfigFile} from './config';
import {resolveBin} from './resolveBin';

const exec = promisify(child_process.exec);

const extensions = ['.ts', '.tsx', '.mjs', '.js', '.json', '.node'];

type Options = {
  input: InputOptions;
  output: OutputOptions[];
};

export async function createRollupConfig(): Promise<Options[]> {
  const config = await readConfigFile();

  return Promise.all(
    config.entrypoints.map(async (entrypoint) => {
      const output: OutputOptions[] = [];

      const mainFile = await getMainFile(entrypoint);
      if (mainFile) {
        output.push({
          file: mainFile,
          format: 'cjs',
          sourcemap: true,
        });
      }

      const moduleFile = await getModuleFile(entrypoint);
      if (mainFile) {
        output.push({
          file: moduleFile,
          format: 'esm',
          sourcemap: true,
        });
      }

      // TODO: handle 'browser' main

      const options: Options = {
        input: {
          input: getSourceFile(entrypoint),
          plugins: [
            nodeExternals({deps: true}),
            nodeResolve({
              extensions,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any,
            commonjs(),
            babel({
              extensions,
              babelHelpers: 'runtime',
              ...createBabelConfigForRollup(),
            }),
            generateDeclarationPlugin(),
          ],
        },
        output,
      };
      return options;
    }),
  );
}

function generateDeclarationPlugin(): Plugin {
  return {
    // TODO: bundle dts
    // https://www.npmjs.com/package/rollup-plugin-dts
    name: 'generate-declarations',
    async buildEnd(this: PluginContext, error) {
      if (error) {
        return;
      }
      try {
        // TODO: ignore test files
        // TODO: look into why folders are being nested
        const tsc = await resolveBin('typescript', {executable: 'tsc'});
        await exec(
          `${tsc} --emitDeclarationOnly --declaration --outDir ${outDirectory} --project ${rootDirectory}/tsconfig.json --pretty`,
          {cwd: rootDirectory},
        );
      } catch (error) {
        console.log(error.stdout);
        // this.error({
        //   message: 'The generation of type declarations failed.',
        // });
      }
    },
  };
}
