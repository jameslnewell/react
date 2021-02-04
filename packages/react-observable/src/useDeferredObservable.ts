import {useRef, useCallback, useMemo} from 'react';
import {
  useResource,
  UseResourceOptions,
  UseResourceResult,
} from './useResource';
import {Factory, Resource} from './Resource';

export interface UseDeferredObservableOptions extends UseResourceOptions {}

export type UseDeferredObservableResult<
  Parameters extends unknown[],
  Value,
  Error
> = UseResourceResult<Value, Error> & {
  invoke(...params: Parameters): void;
};

export function useDeferredObservable<
  Parameters extends unknown[],
  Value,
  Error
>(
  factory: Factory<Parameters, Value, Error> | undefined,
  {
    suspendWhenWaiting = false,
    throwWhenErrored = false,
  }: UseDeferredObservableOptions = {},
): UseDeferredObservableResult<Parameters, Value, Error> {
  const resource = useRef(new Resource<Parameters, Value, Error>(factory));
  const result = useResource(resource.current, {
    suspendWhenWaiting,
    throwWhenErrored,
  });

  const invoke = useCallback((...params: Parameters) => {
    // TODO: silence errors
    resource.current.invoke(...params);
  }, []);

  return useMemo<UseDeferredObservableResult<Parameters, Value, Error>>(
    () => ({
      ...result,
      invoke,
    }),
    [result, factory],
  );
}
