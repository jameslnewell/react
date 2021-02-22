import {Observable} from '@jameslnewell/observable';
import {Factory, State} from './types';
import {useInvokable, UseInvokableOptions} from './useInvokable';

export interface UseDeferredObservableOptions extends UseInvokableOptions {}

export type UseDeferredObservableResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...parameters: Parameters): Observable<Value>;
};

export function useDeferredObservable<Parameters extends unknown[], Value>(
  keys: unknown[],
  factory: Factory<Parameters, Value> | undefined,
  options?: UseDeferredObservableOptions,
): UseDeferredObservableResult<Parameters, Value> {
  const [state, invoke] = useInvokable(keys, factory, options);
  return {
    ...state,
    invoke,
  };
}
