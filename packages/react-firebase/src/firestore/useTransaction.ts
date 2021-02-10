import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {useCallback} from 'react';

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
  const factory = useCallback(() => app.firestore().runTransaction(fn), [
    app,
    fn,
  ]);
  return useDeferredPromise(fn ? factory : undefined, options);
}
