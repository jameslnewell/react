import firebase from 'firebase';
import {create} from '@jameslnewell/observable';
import {
  UseObservableStatus,
  UseObservableMetadata,
  useObservable,
} from '@jameslnewell/react-observable';
import {useApp} from '../app';

export const UseDocumentStatus = UseObservableStatus;
export type UseDocumentStatus = UseObservableStatus;
export type UseDocumentSnapshot = firebase.firestore.DocumentSnapshot;
export type UseDocumentMetadata = UseObservableMetadata<Error>;

export function useDocument(
  document: string | undefined,
): [UseDocumentSnapshot | undefined, UseDocumentMetadata] {
  const app = useApp();
  return useObservable(
    document
      ? () =>
          create((observer) =>
            app.firestore().doc(document).onSnapshot(observer),
          )
      : undefined,
    [app, document],
  );
}
