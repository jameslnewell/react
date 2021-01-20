import React from 'react';

var Context = /*#__PURE__*/ React.createContext(undefined);
var Provider = function Provider(_ref) {
  var app = _ref.app,
    children = _ref.children;
  return /*#__PURE__*/ React.createElement(
    Context.Provider,
    {
      value: app,
    },
    children,
  );
};
var useApp = function useApp() {
  var app = React.useContext(Context);

  if (!app) {
    throw new Error('Please provide a firebase app: <Provider app={app}/>.');
  }

  return app;
};

export {Provider, useApp};
