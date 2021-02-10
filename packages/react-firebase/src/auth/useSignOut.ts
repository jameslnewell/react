import {
  useDeferredPromise,
  UseDeferredPromiseResult,
} from '@jameslnewell/react-promise';
import {useCallback} from 'react';
import {useApp} from '../app';

export type UseSignOutResult = UseDeferredPromiseResult<never[], void>;

export function useSignOut(): UseSignOutResult {
  const app = useApp();
  return useDeferredPromise(useCallback(() => app.auth().signOut(), [app]));
}
