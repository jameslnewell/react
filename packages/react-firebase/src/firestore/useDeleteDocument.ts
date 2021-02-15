import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export interface UseDeleteDocumentOptions extends UseDeferredPromiseOptions {}
export type UseDeleteDocumentResult = UseDeferredPromiseResult<[], void>;

export function useDeleteDocument(
  document: string,
  options?: UseDeleteDocumentOptions,
): UseDeleteDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    () => app.firestore().doc(document).delete(),
    [app, document],
    options,
  );
}
