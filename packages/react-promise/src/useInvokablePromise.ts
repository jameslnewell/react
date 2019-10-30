/* eslint-disable @typescript-eslint/no-explicit-any */
import {useReducer, useEffect, Reducer, useRef} from 'react';
import {Dependencies, Factory, Metadata} from './types';
import {State} from './utils/State';
import {Action, reset} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {execute} from './utils/execute';
import {getMetadata} from './utils/getMetadata';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInvokablePromise<T, P extends any[], E = any>(
  fn: Factory<T, P> | undefined,
  deps: Dependencies,
): [() => void, T | undefined, Metadata<E>] {
  const current = useRef<Promise<any> | undefined>(undefined);
  const isMounted = useMounted();
  const [state, dispatch] = useReducer<Reducer<State<T, E>, Action<T, E>>>(
    reducer,
    initialState,
  );

  const invoke = (...args: P): void => {
    // execute and track the promise state
    if (fn) {
      execute<T, E, P>({fn, dispatch, isMounted, current}, args);
    }
  };

  // reset promise state whenever the dependencies change i.e. the result returned by the function will be a new promise
  useEffect(() => {
    current.current = undefined;
    dispatch(reset());
  }, deps);

  return [invoke, state.value, getMetadata(state)];
}
