import {useEffect, useLayoutEffect, useRef} from 'react';
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
    suspendWhenWaiting = false,
    throwWhenErrored = false,
  }: UseObservableOptions = {},
): UseObservableResult<Value> {
  const result = useDeferredObservable(factory, {
    suspendWhenWaiting,
    throwWhenErrored,
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
