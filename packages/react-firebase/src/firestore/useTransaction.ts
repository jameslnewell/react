import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

const symbol = Symbol();

export interface UseTransactionOptions extends UseDeferredPromiseOptions {}
export type UseTransactionResult = UseDeferredPromiseResult<
  [transaction: firebase.firestore.Transaction],
  void
>;

export function useTransaction(
  factory:
    | ((transaction: firebase.firestore.Transaction) => Promise<void>)
    | undefined,

  options?: UseTransactionOptions,
): UseTransactionResult {
  const app = useApp();
  return useDeferredPromise(
    [symbol, app],
    () => app.firestore().runTransaction(factory!), // TODO: make conditional
    options,
  );
}
