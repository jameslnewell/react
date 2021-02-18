import firebase from 'firebase';
import {create} from '@jameslnewell/observable';
import {
  useObservable,
  UseObservableOptions,
} from '@jameslnewell/react-observable';
import {useApp} from '../app';

export enum UseUserStatus {
  Authenticating = 'authenticating',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

export interface UseUserOptions extends UseObservableOptions {}

export type UseUserResult = {
  status: UseUserStatus;
  value: firebase.User | undefined;
  error: unknown | undefined;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
};

const symbol = Symbol();

export function useUser(options?: UseUserOptions): UseUserResult {
  const app = useApp();
  const result = useObservable(
    [symbol, app],
    () =>
      create<firebase.User | null>((observer) => {
        return app.auth().onAuthStateChanged(observer);
      }),
    options,
  );
  const user = result.value || app.auth().currentUser || undefined;
  const status = user
    ? UseUserStatus.Authenticated
    : result.isWaiting
    ? UseUserStatus.Authenticating
    : UseUserStatus.Unauthenticated;

  return {
    status,
    value: user,
    error: result.error,
    isAuthenticating: status === UseUserStatus.isAuthenticating,
    isAuthenticated: status === UseUserStatus.Authenticated,
    isUnauthenticated: status === UseUserStatus.Unauthenticated,
  };
}
