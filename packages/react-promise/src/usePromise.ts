/* eslint-disable @typescript-eslint/no-explicit-any */
import {useReducer, useEffect, Reducer, useRef} from 'react';
import {Factory, Dependencies} from './types';
import {State} from './utils/State';
import {Action, reset} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {execute} from './utils/execute';
import {getMetadata, Metadata} from './utils/getMetadata';

export function usePromise<T, E = any>(
  fn: Factory<T, []> | undefined,
  deps: Dependencies = [],
): [T | undefined, Metadata<E>] {
  const current = useRef<Promise<any> | undefined>(undefined);
  const isMounted = useMounted();
  const [state, dispatch] = useReducer<Reducer<State<T, E>, Action<T, E>>>(
    reducer,
    initialState,
  );

  useEffect(() => {
    // reset state whenever the dependencies change i.e. the result returned by the function will be a new promise
    // execute and track the promise state
    if (fn) {
      execute<T, E, []>({fn, dispatch, isMounted, current}, []);
    } else {
      current.current = undefined;
      dispatch(reset());
    }
  }, deps);

  return [state.value, getMetadata(state)];
}
