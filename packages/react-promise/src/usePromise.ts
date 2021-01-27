import {useEffect, useRef} from 'react';
import {
  useDeferredPromise,
  UseDeferredPromiseDependencies,
  UseDeferredPromiseFactoryFunction,
  UseDeferredPromiseInvokeAsyncFunction,
  UseDeferredPromiseInvokeFunction,
  UseDeferredPromiseResult,
  UseDeferredPromiseStatus,
} from './useDeferredPromise';

export interface UsePromiseFactory<
  Value = unknown,
  Parameters extends unknown[] = []
> extends UseDeferredPromiseFactoryFunction<Value, Parameters> {}

export interface UsePromiseInvokeFunction<Parameters extends unknown[] = []>
  extends UseDeferredPromiseInvokeFunction<Parameters> {}

export interface UsePromiseInvokeAsyncFunction<
  Value = unknown,
  Parameters extends unknown[] = []
> extends UseDeferredPromiseInvokeAsyncFunction<Value, Parameters> {}

export interface UsePromiseDependencies
  extends UseDeferredPromiseDependencies {}

export interface UsePromiseOptions {
  invokeWhenMounted?: boolean;
  invokeWhenChanged?: boolean;
}

export type UsePromiseStatus = UseDeferredPromiseStatus;
export const UsePromiseStatus = UseDeferredPromiseStatus;

export interface UsePromiseResult<Value = unknown, Error = unknown>
  extends UseDeferredPromiseResult<Value, [], Error> {}

export function usePromise<Value = unknown, Error = unknown>(
  fn: UsePromiseFactory<Value> | undefined,
  deps?: UsePromiseDependencies,
  {invokeWhenMounted = true, invokeWhenChanged = true}: UsePromiseOptions = {},
): UsePromiseResult<Value, Error> {
  const isFirstRun = useRef(true);
  const result = useDeferredPromise<Value, never, Error>(fn, deps);

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
        ? UsePromiseStatus.Pending
        : result.status,
    isPending:
      isFirstRun.current && canInvokeWhenMounted ? true : result.isPending,
  };
}
