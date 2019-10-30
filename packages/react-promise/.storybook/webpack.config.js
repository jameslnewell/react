const path = require('path');

module.exports = ({config}) => {
  // Typescript
  config.resolve.extensions.push('.ts', '.tsx');
  config.module.rules[0].test = /\.(mjs|jsx?|tsx?)$/;

  // CSS
  config.module.rules.push({
    test: /\.scss$/,
    use: ['style-loader', 'css-loader'],
    include: path.resolve(__dirname, '../'),
  });

  return config;
};
