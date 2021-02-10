import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {useCallback} from 'react';

export interface UseSetDocumentOptions extends UseDeferredPromiseOptions {}
export type UseSetDocumentResult = UseDeferredPromiseResult<
  [data: firebase.firestore.DocumentData],
  void
>;

export function useSetDocument(
  document: string,
  options?: UseSetDocumentOptions,
): UseSetDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    useCallback(
      (data: firebase.firestore.DocumentData) =>
        app.firestore().doc(document).set(data),
      [app, document],
    ),
    options,
  );
}
