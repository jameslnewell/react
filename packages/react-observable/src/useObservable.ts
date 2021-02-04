import {useEffect, useRef, useCallback, useMemo} from 'react';
import {
  useResource,
  UseResourceOptions,
  UseResourceResult,
} from './useResource';
import {Resource, Factory} from './Resource';

export interface UseObservableOptions extends UseResourceOptions {
  invokeWhenMounted?: boolean;
  invokeWhenChanged?: boolean;
}

export type UseObservableResult<Value, Error> = UseResourceResult<
  Value,
  Error
> & {
  invoke(): void;
};

export function useObservable<Value, Error>(
  factory: Factory<never[], Value, Error> | undefined,
  {
    invokeWhenMounted = true,
    invokeWhenChanged = true,
    suspendWhenWaiting = false,
    throwWhenErrored = false,
  }: UseObservableOptions = {},
): UseObservableResult<Value, Error> {
  const mounted = useRef(false);
  const resource = useRef(new Resource<never[], Value, Error>(factory));
  const result = useResource(resource.current, {
    suspendWhenWaiting,
    throwWhenErrored,
  });

  const invoke = useCallback(() => {
    // TODO: silence errors
    resource.current.invoke();
  }, []);

  // invoke on mount and change
  useEffect(() => {
    if (invokeWhenMounted && !mounted.current && factory) {
      invoke();
    } else if (invokeWhenChanged && mounted.current && factory) {
      invoke();
    }
    mounted.current = true;
  }, [invokeWhenMounted, invokeWhenChanged, factory]);

  return useMemo<UseObservableResult<Value, Error>>(
    () => ({
      ...result,
      invoke,
    }),
    [result, factory, invoke],
  );
}
