import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {namespace} from './namespace';

export interface UseDeleteDocumentOptions extends UseDeferredPromiseOptions {}
export type UseDeleteDocumentResult = UseDeferredPromiseResult<[], void>;

export function useDeleteDocument(
  document: string | undefined,
  options?: UseDeleteDocumentOptions,
): UseDeleteDocumentResult {
  const app = useApp();
  return useDeferredPromise(
    [namespace, 'useDeleteDocument', app.options, document],
    document ? () => app.firestore().doc(document).delete() : undefined,
    options,
  );
}
