import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export interface UseUpdateDocumentOptions extends UseDeferredPromiseOptions {}
export type UseUpdateDocumentResult = UseDeferredPromiseResult<
  [data: firebase.firestore.DocumentData],
  void
>;

export function useUpdateDocument(
  document: string,
  options?: UseUpdateDocumentOptions,
): UseUpdateDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    (data: firebase.firestore.DocumentData) =>
      app.firestore().doc(document).update(data),
    [app, document],
    options,
  );
}
