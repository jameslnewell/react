import {TransformOptions} from '@babel/core';

const commonPresets = [
  require.resolve('@babel/preset-react'),
  require.resolve('@babel/preset-typescript'),
];

const commonPlugins = [
  require.resolve('@babel/plugin-proposal-class-properties'),
  require.resolve('@babel/plugin-proposal-object-rest-spread'),
];

export function createBabelConfigForRollup(): TransformOptions {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: false,
        },
      ],
      ...commonPresets,
    ],
    plugins: [
      ...commonPlugins,
      require.resolve('@babel/plugin-transform-runtime'),
    ],
  };
}

export function createBabelConfigForJest(): TransformOptions {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: 'commonjs',
          targets: {node: 'current'},
        },
      ],
      ...commonPresets,
    ],
    plugins: [...commonPlugins],
  };
}
