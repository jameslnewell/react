import {
  useInvokablePromise,
  UseInvokablePromiseStatus,
  UseInvokablePromiseMetadata,
} from '@jameslnewell/react-promise';
import firebase from 'firebase';
import {useApp} from '../app';

export const UseDeleteDocumentStatus = UseInvokablePromiseStatus;
export type UseDeleteDocumentStatus = UseInvokablePromiseStatus;
export type UseDeleteDocumentReference = firebase.firestore.DocumentReference;
export type UseDeleteDocumentMetadata = UseInvokablePromiseMetadata;

export type UseDeleteDocumentResult = [
  () => Promise<void>,
  UseDeleteDocumentMetadata,
];

export function useDeleteDocument(
  document: string | undefined,
): UseDeleteDocumentResult {
  const app = useApp();
  const [invoke, , meta] = useInvokablePromise(
    document ? () => app.firestore().doc(document).delete() : undefined,
    [app, document],
  );
  return [invoke, {...meta}];
}
