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
export type UseCollectionResult = UseObservableResult<firebase.firestore.QuerySnapshot>;

export function useCollection(
  collection: string | undefined,
  options?: UseCollectionOptions,
): UseCollectionResult {
  const app = useApp();
  const factory = useCallback(
    () =>
      create<firebase.firestore.QuerySnapshot>((observer) =>
        app.firestore().collection(collection).onSnapshot(observer),
      ),
    [app, collection],
  );
  return useObservable(collection ? factory : undefined, options);
}
