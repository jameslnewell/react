import {
  useDeferredPromise,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export type UseSignOutResult = UseDeferredPromiseResult<never[], void>;

const symbol = Symbol();

export function useSignOut(): UseSignOutResult {
  const app = useApp();
  return useDeferredPromise([symbol, app], () => app.auth().signOut());
}
