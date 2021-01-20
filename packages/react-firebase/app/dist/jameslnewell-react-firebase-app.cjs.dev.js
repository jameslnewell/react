'use strict';

Object.defineProperty(exports, '__esModule', {value: true});

var React = require('react');

function _interopDefault(e) {
  return e && e.__esModule ? e : {default: e};
}

var React__default = /*#__PURE__*/ _interopDefault(React);

var Context = /*#__PURE__*/ React__default['default'].createContext(undefined);
var Provider = function Provider(_ref) {
  var app = _ref.app,
    children = _ref.children;
  return /*#__PURE__*/ React__default['default'].createElement(
    Context.Provider,
    {
      value: app,
    },
    children,
  );
};
var useApp = function useApp() {
  var app = React__default['default'].useContext(Context);

  if (!app) {
    throw new Error('Please provide a firebase app: <Provider app={app}/>.');
  }

  return app;
};

exports.Provider = Provider;
exports.useApp = useApp;
