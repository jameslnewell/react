'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./jameslnewell-react-firebase-auth.cjs.prod.js');
} else {
  module.exports = require('./jameslnewell-react-firebase-auth.cjs.dev.js');
}
