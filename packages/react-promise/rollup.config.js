import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

const extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'];

export default {
  input: `src/index.ts`,
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    resolve({
      extensions,
    }),
    commonjs({inlude: 'node_modules/**'}),
    babel({
      extensions,
      include: 'src/**/*',
      exclude: 'node_modules/**',
    }),
  ],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'es',
    },
  ],
};
