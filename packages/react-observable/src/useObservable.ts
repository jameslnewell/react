import {useEffect, useRef} from 'react';
import {Factory} from './types';
import {
  useDeferredObservable,
  UseDeferredObservableOptions,
  UseDeferredObservableResult,
} from './useDeferredObservable';

export interface UseObservableOptions extends UseDeferredObservableOptions {
  invokeWhenMounted?: boolean;
  invokeWhenChanged?: boolean;
}

export type UseObservableResult<Value> = UseDeferredObservableResult<
  never[],
  Value
>;

export function useObservable<Value>(
  factory: Factory<never[], Value> | undefined,
  {
    invokeWhenMounted = true,
    invokeWhenChanged = true,
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UseObservableOptions = {},
): UseObservableResult<Value> {
  const result = useDeferredObservable(factory, {
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
