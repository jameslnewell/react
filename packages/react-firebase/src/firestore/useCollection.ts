import firebase from 'firebase';
import {create} from '@jameslnewell/observable';
import {
  useObservable,
  UseObservableOptions,
  UseObservableResult,
} from '@jameslnewell/react-observable';
import {useApp} from '../app';
import {useCallback} from 'react';

export type UseCollectionOptions = UseObservableOptions;
export type UseCollectionResult<T> = UseObservableResult<
  firebase.firestore.QuerySnapshot<T>
>;

export function useCollection<T = unknown>(
  collection: string,
  options?: UseCollectionOptions,
): UseCollectionResult<T> {
  const app = useApp();
  const factory = useCallback(
    () =>
      create<firebase.firestore.QuerySnapshot<T>>((observer) =>
        app.firestore().collection(collection).onSnapshot(observer),
      ),
    [app, collection],
  );
  const result = useObservable<firebase.firestore.QuerySnapshot<T>>(
    factory,
    options,
  );
  return result;
}
