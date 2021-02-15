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

type DocumentSnapshot = firebase.firestore.DocumentSnapshot;

export type UseDocumentSnapshotOptions = UseObservableOptions;
export type UseDocumentSnapshotResult = UseObservableResult<DocumentSnapshot>;

export function useDocumentSnapshot(
  document: string | undefined,
  options?: UseDocumentSnapshotOptions,
): UseDocumentSnapshotResult {
  const app = useApp();
  return useObservable(
    document
      ? () =>
          create<DocumentSnapshot>((observer) =>
            app.firestore().doc(document).onSnapshot(observer),
          )
      : undefined,
    [app, document],
    options,
  );
}

export type UseDocumentOptions = UseDocumentSnapshotOptions;
export type UseDocumentResult<Data = unknown> = UseObservableResult<Data>;

export function useDocument<Data = unknown>(
  document: string | undefined,
  options?: UseDocumentOptions,
): UseDocumentResult {
  const result = useDocumentSnapshot(document, options);

  const invokeAsync = useCallback(() => {
    return map((snapshot: DocumentSnapshot) => snapshot.data() as Data)(
      result.invoke(),
    );
  }, [result.invoke]);

  const value = useMemo(() => result.value && result.value.data(), [
    result.value,
  ]);

  if (result.status === Status.Received || result.status === Status.Completed) {
    return {
      ...result,
      invoke: invokeAsync,
      value: value,
    };
  } else {
    return {
      ...result,
      invoke: invokeAsync,
      value: result.value,
    };
  }
}
