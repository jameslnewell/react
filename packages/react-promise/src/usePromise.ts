import {useEffect, useLayoutEffect, useRef} from 'react';
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
  const isFirstLayoutEffectRef = useRef(true);
  const isFirstEffectRef = useRef(true);

  // invoke on mount
  useLayoutEffect(() => {
    if (invokeWhenMounted && factory && isFirstEffectRef.current) {
      result.invoke();
    }
    isFirstLayoutEffectRef.current = false;
  }, [invokeWhenMounted, invokeWhenChanged, factory, result.invoke]);

  // invoke on change
  useEffect(() => {
    if (invokeWhenChanged && factory && !isFirstEffectRef.current) {
      result.invoke();
    }
    isFirstEffectRef.current = false;
  }, [invokeWhenChanged, factory, result.invoke]);

  return result;
}
