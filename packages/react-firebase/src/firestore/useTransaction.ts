import firebase from 'firebase';
import {
  useInvokablePromise,
  UseInvokablePromiseStatus,
  UseInvokablePromiseMetadata,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export const UseTransactionStatus = UseInvokablePromiseStatus;
export type UseTransactionStatus = UseInvokablePromiseStatus;
export type UseTransactionData = firebase.firestore.DocumentData;
export type UseTransactionMetadata = UseInvokablePromiseMetadata;

export type UseTransactionResult = [
  () => Promise<void>,
  UseTransactionMetadata,
];

export function useTransaction(
  fn:
    | ((transaction: firebase.firestore.Transaction) => Promise<void>)
    | undefined,
): UseTransactionResult {
  const app = useApp();
  const [invoke, , meta] = useInvokablePromise(
    fn ? () => app.firestore().runTransaction(fn) : undefined,
    [app],
  );
  return [invoke, meta];
}
