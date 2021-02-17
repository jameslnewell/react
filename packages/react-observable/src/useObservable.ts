import {Factory, Status} from './types';
import {cache} from './cache';
import {
  useDeferredObservable,
  UseDeferredObservableOptions,
  UseDeferredObservableResult,
} from './useDeferredObservable';

export interface UseObservableOptions extends UseDeferredObservableOptions {
  invokeWhenMounted?: boolean;
}

export type UseObservableResult<Value> = UseDeferredObservableResult<[], Value>;

export function useObservable<Value>(
  keys: unknown[],
  factory: Factory<[], Value> | undefined,
  {invokeWhenMounted = true, ...otherOptions}: UseObservableOptions = {},
): UseObservableResult<Value> {
  const result = useDeferredObservable(keys, factory, otherOptions);

  // invoke on mount
  if (invokeWhenMounted && result.status === undefined && factory) {
    if (otherOptions.suspendWhenWaiting) {
      result.invoke();
      throw cache.get(keys)?.suspender;
    } else {
      result.invoke();
      return {
        ...result,
        status: Status.Waiting,
        isWaiting: true,
      };
    }
  }

  return result;
}
