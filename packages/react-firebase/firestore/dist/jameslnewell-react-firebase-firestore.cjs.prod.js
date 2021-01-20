'use strict';

Object.defineProperty(exports, '__esModule', {value: true});

require('react');
var app_dist_jameslnewellReactFirebaseApp = require('../../app/dist/jameslnewell-react-firebase-app.cjs.prod.js');
var objectSpread2 = require('../../dist/objectSpread2-8511d446.cjs.prod.js');
var observable = require('@jameslnewell/observable');
var reactObservable = require('@jameslnewell/react-observable');
var reactPromise = require('@jameslnewell/react-promise');

var UseCollectionStatus = reactObservable.UseObservableStatus;
function useCollection(collection) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();
  return reactObservable.useObservable(
    function () {
      return observable.create(function (observer) {
        return app.firestore().collection(collection).onSnapshot(observer);
      });
    },
    [app, collection],
  );
}

var UseDocumentStatus = reactObservable.UseObservableStatus;
function useDocument(document) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();
  return reactObservable.useObservable(
    document
      ? function () {
          return observable.create(function (observer) {
            return app.firestore().doc(document).onSnapshot(observer);
          });
        }
      : undefined,
    [app, document],
  );
}

var UseAddDocumentStatus = reactPromise.UseInvokablePromiseStatus;
function useAddDocument(collection) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useInvokablePromise = reactPromise.useInvokablePromise(
      function (data) {
        return app.firestore().collection(collection).add(data);
      },
      [app, collection],
    ),
    _useInvokablePromise2 = objectSpread2._slicedToArray(
      _useInvokablePromise,
      3,
    ),
    invoke = _useInvokablePromise2[0],
    ref = _useInvokablePromise2[1],
    meta = _useInvokablePromise2[2];

  return [invoke, ref, meta];
}

var UseSetDocumentStatus = reactPromise.UseInvokablePromiseStatus;
function useSetDocument(document) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useInvokablePromise = reactPromise.useInvokablePromise(
      document
        ? function (data) {
            return app.firestore().doc(document).set(data);
          }
        : undefined,
      [app],
    ),
    _useInvokablePromise2 = objectSpread2._slicedToArray(
      _useInvokablePromise,
      3,
    ),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, meta];
}

var UseUpdateDocumentStatus = reactPromise.UseInvokablePromiseStatus;
function useUpdateDocument(document) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useInvokablePromise = reactPromise.useInvokablePromise(
      document
        ? function (data) {
            return app.firestore().doc(document).update(data);
          }
        : undefined,
      [app],
    ),
    _useInvokablePromise2 = objectSpread2._slicedToArray(
      _useInvokablePromise,
      3,
    ),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, meta];
}

var UseDeleteDocumentStatus = reactPromise.UseInvokablePromiseStatus;
function useDeleteDocument(document) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useInvokablePromise = reactPromise.useInvokablePromise(
      document
        ? function () {
            return app.firestore().doc(document)['delete']();
          }
        : undefined,
      [app, document],
    ),
    _useInvokablePromise2 = objectSpread2._slicedToArray(
      _useInvokablePromise,
      3,
    ),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, objectSpread2._objectSpread2({}, meta)];
}

var UseTransactionStatus = reactPromise.UseInvokablePromiseStatus;
function useTransaction(fn) {
  var app = app_dist_jameslnewellReactFirebaseApp.useApp();

  var _useInvokablePromise = reactPromise.useInvokablePromise(
      fn
        ? function () {
            return app.firestore().runTransaction(fn);
          }
        : undefined,
      [app],
    ),
    _useInvokablePromise2 = objectSpread2._slicedToArray(
      _useInvokablePromise,
      3,
    ),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, meta];
}

exports.UseAddDocumentStatus = UseAddDocumentStatus;
exports.UseCollectionStatus = UseCollectionStatus;
exports.UseDeleteDocumentStatus = UseDeleteDocumentStatus;
exports.UseDocumentStatus = UseDocumentStatus;
exports.UseSetDocumentStatus = UseSetDocumentStatus;
exports.UseTransactionStatus = UseTransactionStatus;
exports.UseUpdateDocumentStatus = UseUpdateDocumentStatus;
exports.useAddDocument = useAddDocument;
exports.useCollection = useCollection;
exports.useDeleteDocument = useDeleteDocument;
exports.useDocument = useDocument;
exports.useSetDocument = useSetDocument;
exports.useTransaction = useTransaction;
exports.useUpdateDocument = useUpdateDocument;
