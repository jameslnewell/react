import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {namespace} from './namespace';

export interface UseSetDocumentOptions extends UseDeferredPromiseOptions {}
export type UseSetDocumentResult = UseDeferredPromiseResult<
  [data: firebase.firestore.DocumentData],
  void
>;

export function useSetDocument(
  document: string | undefined,
  options?: UseSetDocumentOptions,
): UseSetDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    [namespace, 'useSetDocument', app.options, document],
    document
      ? (data: firebase.firestore.DocumentData) =>
          app.firestore().doc(document).set(data)
      : undefined,
    options,
  );
}
