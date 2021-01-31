import {useCallback, useMemo, useRef} from 'react';
import {Factory, Resource} from './Resource';
import {
  useResource,
  UseResourceOptions,
  UseResourceResult,
} from './useResource';

export interface UseDeferredPromiseOptions extends UseResourceOptions {}

export type UseDeferredPromiseResult<
  Parameters extends unknown[],
  Value,
  Error
> = UseResourceResult<Value, Error> & {
  invoke(...params: Parameters): void;
  invokeAsync(...params: Parameters): Promise<Value>;
};

export function useDeferredPromise<Parameters extends unknown[], Value, Error>(
  factory: Factory<Parameters, Value> | undefined,
  {
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UseDeferredPromiseOptions = {},
): UseDeferredPromiseResult<Parameters, Value, Error> {
  const resource = useRef(new Resource<Parameters, Value, Error>());
  const result = useResource(resource.current, {
    suspendWhenPending,
    throwWhenRejected,
  });

  const invoke = useCallback((...params: Parameters) => {
    if (!factory) {
      throw new Error('No factory provided.');
    }
    resource.current.invoke(factory, params).catch(() => {
      /* do nothing */
    });
  }, []);

  const invokeAsync = useCallback((...params: Parameters) => {
    if (!factory) {
      throw new Error('No factory provided.');
    }
    return resource.current.invoke(factory, params);
  }, []);

  return useMemo<UseDeferredPromiseResult<Parameters, Value, Error>>(
    () => ({
      ...result,
      invoke,
      invokeAsync,
    }),
    [result, factory],
  );
}
