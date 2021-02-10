import firebase from 'firebase';
import {create} from '@jameslnewell/observable';
import {
  useObservable,
  UseObservableOptions,
  UseObservableResult,
} from '@jameslnewell/react-observable';
import {useApp} from '../app';
import {useCallback} from 'react';

export type UseDocumentOptions = UseObservableOptions;
export type UseDocumentResult = UseObservableResult<firebase.firestore.DocumentSnapshot>;

export function useDocument(
  document: string | undefined,
  options?: UseDocumentOptions,
): UseDocumentResult {
  const app = useApp();
  const factory = useCallback(
    () =>
      create<firebase.firestore.DocumentSnapshot>((observer) =>
        app.firestore().doc(document).onSnapshot(observer),
      ),
    [app, document],
  );

  return useObservable(document ? factory : undefined, options);
}
