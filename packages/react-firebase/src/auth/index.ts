import {useMemo} from 'react';
import {
  onAuthStateChanged,
  onIdTokenChanged,
  Auth,
  User,
  getAuth,
  signOut,
  signInWithPopup,
  AuthProvider,
  UserCredential,
} from 'firebase/auth';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {
  useInvokablePromise,
  UseInvokablePromiseResult,
} from '@jameslnewell/react-promise';
import {
  createResource,
  Resource,
  useObservable,
  UseObservableResult,
} from '@jameslnewell/react-observable';
import {useApp} from '../app';

export enum Status {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

/**
 * @see https://firebase.google.com/docs/reference/android/com/google/firebase/auth/FirebaseAuth.AuthStateListener
 */
export function getStatus({auth}: {auth: Auth}): Observable<Status> {
  return new Observable<User | null>((subscriber) =>
    onAuthStateChanged(auth, subscriber),
  ).pipe(
    map((user) => (user ? Status.Authenticated : Status.Unauthenticated)),
    shareReplay(1),
  );
}

/**
 * @see https://firebase.google.com/docs/reference/android/com/google/firebase/auth/FirebaseAuth.IdTokenListener
 */
export function getUser({auth}: {auth: Auth}): Observable<User | undefined> {
  return new Observable<User | null>((subscriber) =>
    onIdTokenChanged(auth, subscriber),
  ).pipe(
    map((user) => user ?? undefined),
    shareReplay(1),
  );
}

export function createStatusResource(auth: Auth): Resource<Status> {
  return createResource(getStatus({auth}));
}

export function createUserResource(auth: Auth): Resource<User | undefined> {
  return createResource(getUser({auth}));
}

export function useAuth(): Auth {
  return getAuth(useApp());
}

export function useStatus(): UseObservableResult<Status> {
  const auth = useAuth();
  return useObservable(useMemo(() => getStatus({auth}), [auth]));
}

export function useUser(): UseObservableResult<User | undefined> {
  const auth = useAuth();
  return useObservable(useMemo(() => getUser({auth}), [auth]));
}

export function useSignInWithPopup(): UseInvokablePromiseResult<
  [provider: AuthProvider],
  UserCredential
> {
  const auth = useAuth();
  return useInvokablePromise(
    (provider: AuthProvider) => signInWithPopup(auth, provider),
    [auth],
  );
}

export function useSignOut(): UseInvokablePromiseResult<[], void> {
  const auth = useAuth();
  return useInvokablePromise(() => signOut(auth), [auth]);
}
