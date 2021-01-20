import firebase from 'firebase';
import {create} from '@jameslnewell/observable';
import {
  UseObservableStatus,
  UseObservableMetadata,
  useObservable,
} from '@jameslnewell/react-observable';
import {useApp} from '../app';

export const UseCollectionStatus = UseObservableStatus;
export type UseCollectionStatus = UseObservableStatus;
export type UseCollectionSnapshot = firebase.firestore.QuerySnapshot;
export type UseCollectionMetadata = UseObservableMetadata<Error>;

export function useCollection(
  collection: string,
): [UseCollectionSnapshot | undefined, UseCollectionMetadata] {
  const app = useApp();
  return useObservable(
    () =>
      create<UseCollectionSnapshot, Error>((observer) =>
        app.firestore().collection(collection).onSnapshot(observer),
      ),
    [app, collection],
  );
}
