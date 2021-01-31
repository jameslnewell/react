import {useCallback, useEffect, useMemo, useRef} from 'react';
import {Factory, Resource} from './Resource';
import {
  useResource,
  UseResourceOptions,
  UseResourceResult,
} from './useResource';

export interface UsePromiseOptions extends UseResourceOptions {
  invokeWhenMounted?: boolean;
  invokeWhenChanged?: boolean;
}

export type UsePromiseResult<Value, Error> = UseResourceResult<Value, Error> & {
  invoke(): void;
  invokeAsync(): Promise<Value>;
};

export function usePromise<Value, Error>(
  factory: Factory<never[], Value> | undefined,
  {
    invokeWhenMounted = true,
    invokeWhenChanged = true,
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UsePromiseOptions = {},
): UsePromiseResult<Value, Error> {
  const mounted = useRef(false);
  const resource = useRef(new Resource<never[], Value, Error>());
  const result = useResource(resource.current, {
    suspendWhenPending,
    throwWhenRejected,
  });

  const invoke = useCallback(() => {
    if (!factory) {
      throw new Error('No factory provided.');
    }
    resource.current.invoke(factory, []).catch(() => {
      /* do nothing */
    });
  }, []);

  const invokeAsync = useCallback(() => {
    if (!factory) {
      throw new Error('No factory provided.');
    }
    return resource.current.invoke(factory, []);
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

  return useMemo<UsePromiseResult<Value, Error>>(
    () => ({
      ...result,
      invoke,
      invokeAsync,
    }),
    [result, factory, invoke],
  );
}
