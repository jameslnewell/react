import {
  useDeferredPromise,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useApp} from '../app';

export type UseSignOutResult = UseDeferredPromiseResult<never[], void>;

export function useSignOut(): UseSignOutResult {
  const app = useApp();
  return useDeferredPromise(() => app.auth().signOut(), [app]);
}
