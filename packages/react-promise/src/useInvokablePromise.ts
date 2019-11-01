/* eslint-disable @typescript-eslint/no-explicit-any */
import {useReducer, useEffect, Reducer, useRef} from 'react';
import {Status, Dependencies, Factory, Metadata} from './types';
import {State} from './utils/State';
import {Action, reset} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {execute} from './utils/execute';
import {getMetadata} from './utils/getMetadata';

export {Status as UseInvokablePromiseStatus};
export type UseInvokablePromiseFactory<T, P extends any[]> = Factory<T, P>;
export type UseInvokablePromiseDependencies = Dependencies;
export type UseInvokablePromiseMetadata<E = any> = Metadata<E>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInvokablePromise<T, E = any, P extends any[] = any[]>(
  fn: UseInvokablePromiseFactory<T, P> | undefined,
  deps: UseInvokablePromiseDependencies,
): [() => Promise<T>, T | undefined, UseInvokablePromiseMetadata<E>] {
  const current = useRef<Promise<any> | undefined>(undefined);
  const isMounted = useMounted();
  const [state, dispatch] = useReducer<Reducer<State<T, E>, Action<T, E>>>(
    reducer,
    initialState,
  );

  const invoke = async (...args: P): Promise<T> => {
    if (fn) {
      // execute and track the promise state
      return execute<T, E, P>({fn, dispatch, isMounted, current}, args);
    } else {
      throw new Error(
        "The invoke function cannot be called at this time because the factory didn't return a promise.",
      );
    }
  };

  // reset promise state whenever the dependencies change i.e. the result returned by the function will be a new promise
  useEffect(() => {
    current.current = undefined;
    dispatch(reset());
  }, deps);

  return [invoke, state.value, getMetadata(state)];
}
