/* eslint-env node */
module.exports = (api, opts = {}) => ({
  presets: [
    [
      require('@babel/preset-env'),
      {
        modules: opts.modules,
        targets: opts.targets,
      },
    ],
    [
      require('@babel/preset-react'),
      {
        runtime: 'classic',
      },
    ],
    require('@babel/preset-typescript'),
  ],
  plugins: [
    require('@babel/plugin-proposal-class-properties'),
    require('@babel/plugin-proposal-object-rest-spread'),
  ],
  env: {
    test: {
      // make jest happy
      presets: [
        [
          require('@babel/preset-env'),
          {
            targets: {node: 'current'},
          },
        ],
      ],
    },
  },
});
