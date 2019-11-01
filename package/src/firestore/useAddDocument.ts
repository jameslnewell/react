import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {
  useInvokablePromise,
  UseInvokablePromiseStatus,
  UseInvokablePromiseMetadata,
} from '@jameslnewell/react-promise';
import {useApp} from '@jameslnewell/react-firebase/app';

export const UseAddDocumentStatus = UseInvokablePromiseStatus;
export type UseAddDocumentStatus = UseInvokablePromiseStatus;
export type UseAddDocumentData = firebase.firestore.DocumentData;
export type UseAddDocumentReference = firebase.firestore.DocumentReference;
export type UseAddDocumentMetadata = UseInvokablePromiseMetadata & {
  value?: UseAddDocumentReference;
};

export function useAddDocument(
  collection: string,
): [(data: UseAddDocumentData) => void, UseAddDocumentMetadata] {
  const app = useApp();
  const [invoke, value, meta] = useInvokablePromise(
    (data: UseAddDocumentData) =>
      app
        .firestore()
        .collection(collection)
        .add(data),
    [app, collection],
  );
  return [invoke, {...meta, value}];
}
