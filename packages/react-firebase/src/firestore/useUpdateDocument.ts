import firebase from 'firebase';
import {
  useInvokablePromise,
  UseInvokablePromiseStatus,
  UseInvokablePromiseMetadata,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export const UseUpdateDocumentStatus = UseInvokablePromiseStatus;
export type UseUpdateDocumentStatus = UseInvokablePromiseStatus;
export type UseUpdateDocumentData = firebase.firestore.DocumentData;
export type UseUpdateDocumentMetadata = UseInvokablePromiseMetadata;

export type UseUpdateDocumentResult = [
  (data: UseUpdateDocumentData) => Promise<void>,
  UseUpdateDocumentMetadata,
];

export function useUpdateDocument(
  document: string | undefined,
): UseUpdateDocumentResult {
  const app = useApp();
  const [invoke, , meta] = useInvokablePromise(
    document
      ? (data: UseUpdateDocumentData) =>
          app.firestore().doc(document).update(data)
      : undefined,
    [app],
  );
  return [invoke, meta];
}
