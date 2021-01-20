'use strict';

Object.defineProperty(exports, '__esModule', {value: true});

require('react');
var app_dist_jameslnewellReactFirebaseApp = require('../../app/dist/jameslnewell-react-firebase-app.cjs.prod.js');
var objectSpread2 = require('../../dist/objectSpread2-8511d446.cjs.prod.js');
var observable = require('@jameslnewell/observable');
var reactObservable = require('@jameslnewell/react-observable');
var reactPromise = require('@jameslnewell/react-promise');

(function (UseUserStatus) {
  UseUserStatus['Authenticating'] = 'authenticating';
  UseUserStatus['Authenticated'] = 'authenticated';
  UseUserStatus['Unauthenticated'] = 'unauthenticated';
  UseUserStatus['Errored'] = 'errored';
})(exports.UseUserStatus || (exports.UseUserStatus = {}));

function useUser() {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useObservable = reactObservable.useObservable(
      function () {
        return observable.create(function (observer) {
          return app.auth().onAuthStateChanged(observer);
        });
      },
      [app],
    ),
    _useObservable2 = objectSpread2._slicedToArray(_useObservable, 2),
    value = _useObservable2[0],
    metadata = _useObservable2[1];

  var user = value || app.auth().currentUser || undefined;

  var status = (function () {
    if (metadata.isErrored) {
      return exports.UseUserStatus.Errored;
    }

    if (user) {
      return exports.UseUserStatus.Authenticated;
    }

    if ((metadata.isReceived || metadata.isCompleted) && user === undefined) {
      return exports.UseUserStatus.Unauthenticated;
    }

    return exports.UseUserStatus.Authenticating;
  })();

  return [
    user,
    {
      status: status,
      error: metadata.error,
      isAuthenticating: status === exports.UseUserStatus.Authenticating,
      isAuthenticated: status === exports.UseUserStatus.Authenticated,
      isUnauthenticated: status === exports.UseUserStatus.Unauthenticated,
      isErrored: status === exports.UseUserStatus.Errored,
    },
  ];
}

function useSignInWithPopup() {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useInvokablePromise = reactPromise.useInvokablePromise(
      function (provider) {
        return app.auth().signInWithPopup(provider);
      },
      [app],
    ),
    _useInvokablePromise2 = objectSpread2._slicedToArray(
      _useInvokablePromise,
      3,
    ),
    invoke = _useInvokablePromise2[0],
    value = _useInvokablePromise2[1],
    metadata = _useInvokablePromise2[2];

  return [
    invoke,
    objectSpread2._objectSpread2(
      objectSpread2._objectSpread2({}, metadata),
      {},
      {
        value: value,
      },
    ),
  ];
}

function useSignOut() {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useInvokablePromise = reactPromise.useInvokablePromise(
      function () {
        return app.auth().signOut();
      },
      [app],
    ),
    _useInvokablePromise2 = objectSpread2._slicedToArray(
      _useInvokablePromise,
      3,
    ),
    invoke = _useInvokablePromise2[0],
    metadata = _useInvokablePromise2[2];

  return [invoke, metadata];
}

exports.useSignInWithPopup = useSignInWithPopup;
exports.useSignOut = useSignOut;
exports.useUser = useUser;
