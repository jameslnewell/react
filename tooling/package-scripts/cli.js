#! /usr/bin/env node
/* eslint-env node */
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'esnext',
  },
  transpileOnly: true,
});
require('./src/cli');
