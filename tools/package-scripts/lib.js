#! /usr/bin/env node
/* eslint-env node */
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'esnext',
  },
  transpileOnly: true,
});
module.exports = require('./src/lib');
