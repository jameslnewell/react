import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export interface UseTransactionOptions extends UseDeferredPromiseOptions {}
export type UseTransactionResult = UseDeferredPromiseResult<
  [transaction: firebase.firestore.Transaction],
  void
>;

export function useTransaction(
  fn:
    | ((transaction: firebase.firestore.Transaction) => Promise<void>)
    | undefined,

  options?: UseTransactionOptions,
): UseTransactionResult {
  const app = useApp();
  return useDeferredPromise(
    fn ? () => app.firestore().runTransaction(fn) : undefined,
    [app],
    options,
  );
}
