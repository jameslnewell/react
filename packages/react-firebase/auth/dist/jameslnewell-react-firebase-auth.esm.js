import 'react';
import {useApp} from '../../app/dist/jameslnewell-react-firebase-app.esm.js';
import {
  _ as _slicedToArray,
  a as _objectSpread2,
} from '../../dist/objectSpread2-d91123eb.esm.js';
import {create} from '@jameslnewell/observable';
import {useObservable} from '@jameslnewell/react-observable';
import {useInvokablePromise} from '@jameslnewell/react-promise';

var UseUserStatus;

(function (UseUserStatus) {
  UseUserStatus['Authenticating'] = 'authenticating';
  UseUserStatus['Authenticated'] = 'authenticated';
  UseUserStatus['Unauthenticated'] = 'unauthenticated';
  UseUserStatus['Errored'] = 'errored';
})(UseUserStatus || (UseUserStatus = {}));

function useUser() {
  var app = useApp();

  var _useObservable = useObservable(
      function () {
        return create(function (observer) {
          return app.auth().onAuthStateChanged(observer);
        });
      },
      [app],
    ),
    _useObservable2 = _slicedToArray(_useObservable, 2),
    value = _useObservable2[0],
    metadata = _useObservable2[1];

  var user = value || app.auth().currentUser || undefined;

  var status = (function () {
    if (metadata.isErrored) {
      return UseUserStatus.Errored;
    }

    if (user) {
      return UseUserStatus.Authenticated;
    }

    if ((metadata.isReceived || metadata.isCompleted) && user === undefined) {
      return UseUserStatus.Unauthenticated;
    }

    return UseUserStatus.Authenticating;
  })();

  return [
    user,
    {
      status: status,
      error: metadata.error,
      isAuthenticating: status === UseUserStatus.Authenticating,
      isAuthenticated: status === UseUserStatus.Authenticated,
      isUnauthenticated: status === UseUserStatus.Unauthenticated,
      isErrored: status === UseUserStatus.Errored,
    },
  ];
}

function useSignInWithPopup() {
  var app = useApp();

  var _useInvokablePromise = useInvokablePromise(
      function (provider) {
        return app.auth().signInWithPopup(provider);
      },
      [app],
    ),
    _useInvokablePromise2 = _slicedToArray(_useInvokablePromise, 3),
    invoke = _useInvokablePromise2[0],
    value = _useInvokablePromise2[1],
    metadata = _useInvokablePromise2[2];

  return [
    invoke,
    _objectSpread2(
      _objectSpread2({}, metadata),
      {},
      {
        value: value,
      },
    ),
  ];
}

function useSignOut() {
  var app = useApp();

  var _useInvokablePromise = useInvokablePromise(
      function () {
        return app.auth().signOut();
      },
      [app],
    ),
    _useInvokablePromise2 = _slicedToArray(_useInvokablePromise, 3),
    invoke = _useInvokablePromise2[0],
    metadata = _useInvokablePromise2[2];

  return [invoke, metadata];
}

export {UseUserStatus, useSignInWithPopup, useSignOut, useUser};
