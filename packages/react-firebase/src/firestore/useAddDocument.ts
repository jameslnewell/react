import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {namespace} from './namespace';

export interface UseAddDocumentOptions extends UseDeferredPromiseOptions {}
export type UseAddDocumentResult = UseDeferredPromiseResult<
  [data: firebase.firestore.DocumentData],
  firebase.firestore.DocumentReference
>;

export function useAddDocument(
  collection: string | undefined,
  options?: UseAddDocumentOptions,
): UseAddDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    [namespace, 'useAddDocument', app.options, collection],
    collection
      ? (data: firebase.firestore.DocumentData) =>
          app.firestore().collection(collection).add(data)
      : undefined,
    options,
  );
}
