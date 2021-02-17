import firebase from 'firebase';
import {create, map} from '@jameslnewell/observable';
import {
  Status,
  useObservable,
  UseObservableOptions,
  UseObservableResult,
} from '@jameslnewell/react-observable';
import {useApp} from '../app';
import {useCallback, useMemo} from 'react';

type CollectionSnapshot = firebase.firestore.QuerySnapshot;

export type UseCollectionSnapshotOptions = UseObservableOptions;
export type UseCollectionSnapshotResult = UseObservableResult<CollectionSnapshot>;

const symbol = Symbol();

export function useCollectionSnapshot(
  collection: string | undefined,
  options?: UseCollectionSnapshotOptions,
): UseCollectionSnapshotResult {
  const app = useApp();
  return useObservable(
    [symbol, app, collection],
    collection
      ? () =>
          create<CollectionSnapshot>((observer) =>
            app.firestore().collection(collection).onSnapshot(observer),
          )
      : undefined,
    options,
  );
}

export type UseCollectionOptions = UseCollectionSnapshotOptions;
export type UseCollectionResult<Data = unknown> = UseObservableResult<
  [string, Data][]
>;

export function useCollection<Data = unknown>(
  collection: string | undefined,
  options?: UseCollectionOptions,
): UseCollectionResult {
  const result = useCollectionSnapshot(collection, options);

  const invokeAsync = useCallback(() => {
    return map((snapshot: CollectionSnapshot) =>
      snapshot.docs.map<[string, Data]>((doc) => [doc.id, doc.data() as Data]),
    )(result.invoke());
  }, [result.invoke]);

  const value = useMemo(
    () =>
      result.value &&
      result.value.docs.map((doc) => [doc.id, doc.data() as Data]),
    [result.value],
  );

  if (result.status === Status.Received || result.status === Status.Completed) {
    return {
      ...result,
      invoke: invokeAsync,
      value: value as [string, Data][],
    };
  } else {
    return {
      ...result,
      invoke: invokeAsync,
      value: result.value,
    };
  }
}
