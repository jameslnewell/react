import firebase from 'firebase';
import {
  useInvokablePromise,
  UseInvokablePromiseStatus,
  UseInvokablePromiseMetadata,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export const UseSetDocumentStatus = UseInvokablePromiseStatus;
export type UseSetDocumentStatus = UseInvokablePromiseStatus;
export type UseSetDocumentData = firebase.firestore.DocumentData;
export type UseSetDocumentMetadata = UseInvokablePromiseMetadata;

export type UseSetDocumentResult = [
  (path: string, data: UseSetDocumentData) => Promise<void>,
  UseSetDocumentMetadata,
];

export function useSetDocument(): UseSetDocumentResult {
  const app = useApp();
  const [invoke, , meta] = useInvokablePromise(
    (path: string, data: UseSetDocumentData) =>
      app.firestore().doc(path).set(data),
    [app],
  );
  return [invoke, meta];
}
