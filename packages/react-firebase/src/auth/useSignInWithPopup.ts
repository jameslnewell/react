import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';
import {useCallback} from 'react';

export type UseSignInWithPopupProvider = firebase.auth.AuthProvider;
export type UseSignInWithPopupUser = firebase.auth.UserCredential;
export type UseSignInResult = UseDeferredPromiseResult<
  [UseSignInWithPopupProvider],
  UseSignInWithPopupUser
>;

export function useSignInWithPopup(): UseSignInResult {
  const app = useApp();
  return useDeferredPromise(
    useCallback(
      (provider: UseSignInWithPopupProvider) =>
        app.auth().signInWithPopup(provider),
      [app],
    ),
  );
}
