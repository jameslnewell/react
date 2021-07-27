/* eslint-env node */
module.exports = {
  stories: ['../../packages/*/src/**/*.stories.@(ts|tsx)'],
  features: {
    postcss: false,
  },
  typescript: {
    check: false,
  },
};
