import {useEffect, useRef} from 'react';
import {Factory} from './types';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from './useDeferredPromise';

export interface UsePromiseOptions extends UseDeferredPromiseOptions {
  invokeWhenMounted?: boolean;
  invokeWhenChanged?: boolean;
}

export type UsePromiseResult<Value> = UseDeferredPromiseResult<never[], Value>;

export function usePromise<Value>(
  factory: Factory<never[], Value> | undefined,
  {
    invokeWhenMounted = true,
    invokeWhenChanged = true,
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UsePromiseOptions = {},
): UsePromiseResult<Value> {
  const result = useDeferredPromise(factory, {
    suspendWhenPending,
    throwWhenRejected,
  });
  const mountedRef = useRef(false);

  // invoke on mount and change
  if (invokeWhenMounted && !mountedRef.current && factory) {
    result.invoke();
  }
  useEffect(() => {
    mountedRef.current = true;
    if (invokeWhenChanged && mountedRef.current && factory) {
      result.invoke();
    }

    // TODO: include result in deps
  }, [invokeWhenMounted, invokeWhenChanged, factory]);

  return result;
}
