/* eslint-env node */
module.exports = {
  stories: ['../../packages/*/src/**/*.stories.@(ts|tsx)'],
  core: {
    builder: 'webpack5',
  },
};
