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
import {namespace} from './namespace';

type CollectionSnapshot = firebase.firestore.QuerySnapshot;

export type UseCollectionSnapshotCreateCollectionFunction = (
  db: firebase.firestore.Firestore,
) => firebase.firestore.Query;
export type UseCollectionSnapshotOptions = UseObservableOptions;
export type UseCollectionSnapshotResult =
  UseObservableResult<firebase.firestore.QuerySnapshot>;

export function useCollectionSnapshot(
  keys: unknown[],
  factory: UseCollectionSnapshotCreateCollectionFunction | undefined,
  options?: UseCollectionSnapshotOptions,
): UseCollectionSnapshotResult {
  const app = useApp();
  return useObservable(
    [namespace, 'useCollectionSnapshot', app.options, ...keys],
    factory
      ? () =>
          create((observer) => factory(app.firestore()).onSnapshot(observer))
      : undefined,
    options,
  );
}

export interface UseCollectionOptions extends UseCollectionSnapshotOptions {
  limit?: number;
  where?: [string, firebase.firestore.WhereFilterOp, string][];
}
export type UseCollectionResult<Data = unknown> = UseObservableResult<
  [string, Data][]
>;

export function useCollection<Data = unknown>(
  collection: string | undefined,
  {limit, where, ...otherOptions}: UseCollectionOptions = {},
): UseCollectionResult<Data> {
  const result = useCollectionSnapshot(
    [limit, JSON.stringify(where)],
    collection
      ? (db) => {
          let ref: firebase.firestore.Query = db.collection(collection);

          if (limit) {
            ref = ref.limit(limit);
          }

          if (where) {
            ref = where.reduce((r, criteria) => r.where(...criteria), ref);
          }

          return ref;
        }
      : undefined,
    otherOptions,
  );

  const invoke = useCallback(() => {
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
      invoke,
      value: value as [string, Data][],
    };
  } else {
    return {
      ...result,
      invoke,
    };
  }
}
