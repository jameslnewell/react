import {useEffect, useRef} from 'react';
import {Result, Factory, Status} from './types';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
} from './useDeferredPromise';

export interface UsePromiseOptions extends UseDeferredPromiseOptions {
  invokeWhenMounted?: boolean;
  invokeWhenChanged?: boolean;
}

export function usePromise<Value = unknown, Error = unknown>(
  fn: Factory<never, Value> | undefined,
  {
    invokeWhenMounted = true,
    invokeWhenChanged = true,
    ...opts
  }: UsePromiseOptions = {},
): Result<never, Value, Error> {
  const isFirstRun = useRef(true);
  const result = useDeferredPromise<never, Value, Error>(fn, opts);

  const canInvokeWhenMounted = !!fn && invokeWhenMounted;
  const canInvokeWhenChanged = !!fn && invokeWhenChanged;

  // invoke when mounted or changed
  useEffect(() => {
    if (isFirstRun.current && canInvokeWhenMounted) {
      result.invoke();
    }
    if (!isFirstRun.current && canInvokeWhenChanged) {
      result.invoke();
    }
    isFirstRun.current = false;
  }, [canInvokeWhenMounted, canInvokeWhenChanged, result.invoke]);

  return {
    ...result,
    status:
      isFirstRun.current && canInvokeWhenMounted
        ? Status.Pending
        : result.status,
    isPending:
      isFirstRun.current && canInvokeWhenMounted ? true : result.isPending,
  };
}
