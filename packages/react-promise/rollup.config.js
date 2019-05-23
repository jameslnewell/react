import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import {dependencies, peerDependencies} from './package.json';

const extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'];

export default {
  input: `src/index.ts`,
  output: [
    {
      file: `lib/index.js`,
      format: 'cjs',
    },
    {
      file: `lib/index.mjs`,
      format: 'esm',
    },
  ],
  external: [
    ...Object.keys(dependencies || {}),
    ...Object.keys(peerDependencies || {}),
  ],
  plugins: [
    babel({
      extensions,
    }),
    resolve({
      extensions,
    }),
  ],
};
