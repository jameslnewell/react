import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {useCallback} from 'react';

export interface UseDeleteDocumentOptions extends UseDeferredPromiseOptions {}
export type UseDeleteDocumentResult = UseDeferredPromiseResult<[], void>;

export function useDeleteDocument(
  document: string,
  options?: UseDeleteDocumentOptions,
): UseDeleteDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    useCallback(() => app.firestore().doc(document).delete(), [app, document]),
    options,
  );
}
