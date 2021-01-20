import 'react';
import {useApp} from '../../app/dist/jameslnewell-react-firebase-app.esm.js';
import {
  _ as _slicedToArray,
  a as _objectSpread2,
} from '../../dist/objectSpread2-d91123eb.esm.js';
import {create} from '@jameslnewell/observable';
import {
  UseObservableStatus,
  useObservable,
} from '@jameslnewell/react-observable';
import {
  UseInvokablePromiseStatus,
  useInvokablePromise,
} from '@jameslnewell/react-promise';

var UseCollectionStatus = UseObservableStatus;
function useCollection(collection) {
  var app = useApp();
  return useObservable(
    function () {
      return create(function (observer) {
        return app.firestore().collection(collection).onSnapshot(observer);
      });
    },
    [app, collection],
  );
}

var UseDocumentStatus = UseObservableStatus;
function useDocument(document) {
  var app = useApp();
  return useObservable(
    document
      ? function () {
          return create(function (observer) {
            return app.firestore().doc(document).onSnapshot(observer);
          });
        }
      : undefined,
    [app, document],
  );
}

var UseAddDocumentStatus = UseInvokablePromiseStatus;
function useAddDocument(collection) {
  var app = useApp();

  var _useInvokablePromise = useInvokablePromise(
      function (data) {
        return app.firestore().collection(collection).add(data);
      },
      [app, collection],
    ),
    _useInvokablePromise2 = _slicedToArray(_useInvokablePromise, 3),
    invoke = _useInvokablePromise2[0],
    ref = _useInvokablePromise2[1],
    meta = _useInvokablePromise2[2];

  return [invoke, ref, meta];
}

var UseSetDocumentStatus = UseInvokablePromiseStatus;
function useSetDocument(document) {
  var app = useApp();

  var _useInvokablePromise = useInvokablePromise(
      document
        ? function (data) {
            return app.firestore().doc(document).set(data);
          }
        : undefined,
      [app],
    ),
    _useInvokablePromise2 = _slicedToArray(_useInvokablePromise, 3),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, meta];
}

var UseUpdateDocumentStatus = UseInvokablePromiseStatus;
function useUpdateDocument(document) {
  var app = useApp();

  var _useInvokablePromise = useInvokablePromise(
      document
        ? function (data) {
            return app.firestore().doc(document).update(data);
          }
        : undefined,
      [app],
    ),
    _useInvokablePromise2 = _slicedToArray(_useInvokablePromise, 3),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, meta];
}

var UseDeleteDocumentStatus = UseInvokablePromiseStatus;
function useDeleteDocument(document) {
  var app = useApp();

  var _useInvokablePromise = useInvokablePromise(
      document
        ? function () {
            return app.firestore().doc(document)['delete']();
          }
        : undefined,
      [app, document],
    ),
    _useInvokablePromise2 = _slicedToArray(_useInvokablePromise, 3),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, _objectSpread2({}, meta)];
}

var UseTransactionStatus = UseInvokablePromiseStatus;
function useTransaction(fn) {
  var app = useApp();

  var _useInvokablePromise = useInvokablePromise(
      fn
        ? function () {
            return app.firestore().runTransaction(fn);
          }
        : undefined,
      [app],
    ),
    _useInvokablePromise2 = _slicedToArray(_useInvokablePromise, 3),
    invoke = _useInvokablePromise2[0],
    meta = _useInvokablePromise2[2];

  return [invoke, meta];
}

export {
  UseAddDocumentStatus,
  UseCollectionStatus,
  UseDeleteDocumentStatus,
  UseDocumentStatus,
  UseSetDocumentStatus,
  UseTransactionStatus,
  UseUpdateDocumentStatus,
  useAddDocument,
  useCollection,
  useDeleteDocument,
  useDocument,
  useSetDocument,
  useTransaction,
  useUpdateDocument,
};
