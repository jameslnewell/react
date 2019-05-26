import {useReducer, useEffect, Reducer} from 'react';
import {Factory, Dependencies} from './types';
import {State} from './utils/State';
import {Action, reset} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {isPromise} from './utils/isPromise';
import {track} from './utils/track';
import {getOutput, Output} from './utils/getOutput';

export function usePromise<T>(
  fn: Factory<T, []>,
  deps: Dependencies = [],
): Output<T> {
  const isMounted = useMounted();
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(
    reducer,
    initialState,
  );

  useEffect(() => {
    // reset state whenever the dependencies change i.e. the result returned by the function will be a new promise
    // execute and track the promise state
    const promise = fn();
    if (isPromise(promise)) {
      track(promise, dispatch, isMounted);
    } else {
      dispatch(reset());
    }
  }, deps);

  return getOutput(state);
}
