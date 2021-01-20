import firebase from 'firebase';
import {
  useInvokablePromise,
  UseInvokablePromiseStatus,
  UseInvokablePromiseMetadata,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export const UseAddDocumentStatus = UseInvokablePromiseStatus;
export type UseAddDocumentStatus = UseInvokablePromiseStatus;
export type UseAddDocumentData = firebase.firestore.DocumentData;
export type UseAddDocumentReference = firebase.firestore.DocumentReference;
export type UseAddDocumentMetadata = UseInvokablePromiseMetadata;

export type UseAddDocumentResult = [
  (data: UseAddDocumentData) => Promise<UseAddDocumentReference>,
  UseAddDocumentReference | undefined,
  UseAddDocumentMetadata,
];

export function useAddDocument(collection: string): UseAddDocumentResult {
  const app = useApp();
  const [invoke, ref, meta] = useInvokablePromise(
    (data: UseAddDocumentData) =>
      app.firestore().collection(collection).add(data),
    [app, collection],
  );
  return [invoke, ref, meta];
}
