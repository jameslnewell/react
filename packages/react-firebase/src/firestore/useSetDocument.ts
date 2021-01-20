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
  (data: UseSetDocumentData) => Promise<void>,
  UseSetDocumentMetadata,
];

export function useSetDocument(
  document: string | undefined,
): UseSetDocumentResult {
  const app = useApp();
  const [invoke, , meta] = useInvokablePromise(
    document
      ? (data: UseSetDocumentData) => app.firestore().doc(document).set(data)
      : undefined,
    [app],
  );
  return [invoke, meta];
}
