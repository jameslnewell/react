import {useReducer, useEffect, Reducer} from 'react';
import {Factory, Dependencies, Status} from './types';
import {State} from './utils/State';
import {
  Action,
  observed,
  completed,
  errored,
  reset,
  observing,
} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {isObservable} from 'rxjs';

export interface Output<T> extends State<T> {
  isWaiting: boolean;
  isReceived: boolean;
  isCompleted: boolean;
  isErrored: boolean;
}

export function useObservable<T>(
  fn: Factory<T, []>,
  deps: Dependencies = [],
): Output<T> {
  const isMounted = useMounted();
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(
    reducer,
    initialState,
  );

  useEffect(() => {
    // reset state whenever the dependencies change i.e. the result returned by the function will be a new observable
    // execute and track the promise state
    const observable = fn();
    dispatch(observing());
    if (isObservable(observable)) {
      const subscription = observable.subscribe({
        next: value => {
          if (isMounted) {
            dispatch(observed(value));
          }
        },
        error: error => {
          if (isMounted) {
            dispatch(errored(error));
          }
        },
        complete: () => {
          if (isMounted) {
            dispatch(completed());
          }
        },
      });
      return () => {
        subscription.unsubscribe();
      };
    } else {
      dispatch(reset());
    }
  }, deps);

  return {
    ...state,
    isWaiting: state.status === Status.Waiting,
    isReceived: state.status === Status.Receieved,
    isCompleted: state.status === Status.Completed,
    isErrored: state.status === Status.Errored,
  };
}
