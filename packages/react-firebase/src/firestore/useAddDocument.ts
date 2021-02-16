import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

const symbol = Symbol();

export interface UseAddDocumentOptions extends UseDeferredPromiseOptions {}
export type UseAddDocumentResult = UseDeferredPromiseResult<
  [data: firebase.firestore.DocumentData],
  firebase.firestore.DocumentReference
>;

export function useAddDocument(
  collection: string,
  options?: UseAddDocumentOptions,
): UseAddDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    [symbol, app, collection],
    (data: firebase.firestore.DocumentData) =>
      app.firestore().collection(collection).add(data),
    options,
  );
}
