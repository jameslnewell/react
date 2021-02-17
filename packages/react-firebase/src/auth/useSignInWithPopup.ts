import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export type UseSignInWithPopupProvider = firebase.auth.AuthProvider;
export type UseSignInWithPopupUser = firebase.auth.UserCredential;
export type UseSignInResult = UseDeferredPromiseResult<
  [UseSignInWithPopupProvider],
  UseSignInWithPopupUser
>;

const symbol = Symbol();

export function useSignInWithPopup(): UseSignInResult {
  const app = useApp();
  return useDeferredPromise(
    [symbol, app],
    (provider: UseSignInWithPopupProvider) =>
      app.auth().signInWithPopup(provider),
  );
}
