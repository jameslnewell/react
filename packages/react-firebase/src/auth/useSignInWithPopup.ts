import firebase from 'firebase';
import {
  useDeferredPromise,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export type UseSignInResult = UseDeferredPromiseResult<
  [firebase.auth.AuthProvider],
  firebase.auth.UserCredential
>;

const symbol = Symbol();

export function useSignInWithPopup(): UseSignInResult {
  const app = useApp();
  return useDeferredPromise(
    [symbol, app],
    (provider: firebase.auth.AuthProvider) =>
      app.auth().signInWithPopup(provider),
  );
}
