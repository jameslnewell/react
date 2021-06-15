import {Factory, State} from './types';
import {useInvokable, UseInvokableOptions} from './useInvokable';

export interface UseDeferredPromiseOptions extends UseInvokableOptions {}

export type UseDeferredPromiseResult<
  Parameters extends unknown[],
  Value,
> = State<Value> & {
  invoke(...parameters: Parameters): Promise<Value>;
};

export function useDeferredPromise<Parameters extends unknown[], Value>(
  keys: unknown[],
  factory: Factory<Parameters, Value> | undefined,
  options?: UseDeferredPromiseOptions,
): UseDeferredPromiseResult<Parameters, Value> {
  const [state, invoke] = useInvokable(keys, factory, options);
  return {
    ...state,
    invoke,
  };
}
