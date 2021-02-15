import {useEffect, useLayoutEffect, useRef} from 'react';
import {Factory} from './types';
import {
  useDeferredObservable,
  UseDeferredObservableDependencies,
  UseDeferredObservableOptions,
  UseDeferredObservableResult,
} from './useDeferredObservable';

export type UseObservableDependencies = UseDeferredObservableDependencies;

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
  deps: UseObservableDependencies,
  {
    invokeWhenMounted = true,
    invokeWhenChanged = true,
    suspendWhenWaiting = false,
    throwWhenErrored = false,
  }: UseObservableOptions = {},
): UseObservableResult<Value> {
  const result = useDeferredObservable(factory, deps, {
    suspendWhenWaiting,
    throwWhenErrored,
  });
  const isFirstLayoutEffectRef = useRef(true);
  const isFirstEffectRef = useRef(true);

  // invoke on mount
  useLayoutEffect(() => {
    if (invokeWhenMounted && factory && isFirstEffectRef.current) {
      result.invokeSilently();
    }
    isFirstLayoutEffectRef.current = false;
  }, [invokeWhenMounted, invokeWhenChanged, ...deps, result.invokeSilently]);

  // invoke on change
  useEffect(() => {
    if (invokeWhenChanged && factory && !isFirstEffectRef.current) {
      result.invokeSilently();
    }
    isFirstEffectRef.current = false;
  }, [invokeWhenChanged, ...deps, result.invokeSilently]);

  return result;
}
