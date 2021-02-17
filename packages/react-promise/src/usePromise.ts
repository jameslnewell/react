import {Factory, Status} from './types';
import {noop} from './noop';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from './useDeferredPromise';

export interface UsePromiseOptions extends UseDeferredPromiseOptions {
  invokeWhenMounted?: boolean;
}

export type UsePromiseResult<Value> = UseDeferredPromiseResult<[], Value>;

export function usePromise<Value>(
  keys: unknown[],
  factory: Factory<[], Value> | undefined,
  {invokeWhenMounted = true, ...otherOptions}: UsePromiseOptions = {},
): UsePromiseResult<Value> {
  const result = useDeferredPromise(keys, factory, otherOptions);

  // invoke on mount
  if (invokeWhenMounted && result.status === undefined && factory) {
    if (otherOptions.suspendWhenPending) {
      throw result.invoke();
    } else {
      result.invoke().then(noop, noop);
      return {
        ...result,
        status: Status.Pending,
        isPending: true,
      };
    }
  }

  return result;
}
