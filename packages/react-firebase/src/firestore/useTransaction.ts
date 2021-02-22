import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {namespace} from './namespace';

export interface UseTransactionOptions extends UseDeferredPromiseOptions {}
export type UseTransactionResult = UseDeferredPromiseResult<
  [transaction: firebase.firestore.Transaction],
  void
>;

export function useTransaction(
  keys: unknown[],
  createTransaction:
    | ((transaction: firebase.firestore.Transaction) => Promise<void>)
    | undefined,

  options?: UseTransactionOptions,
): UseTransactionResult {
  const app = useApp();
  return useDeferredPromise(
    [namespace, 'useTransaction', app.options, ...keys],
    createTransaction
      ? () => app.firestore().runTransaction(createTransaction)
      : undefined,
    options,
  );
}
