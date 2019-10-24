import {useReducer, useEffect, Reducer, useRef} from 'react';
import {Subscription} from '@jameslnewell/observable';
import {Factory, Dependencies} from './types';
import {State} from './utils/State';
import {Action, reset} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {invoke} from './utils/invoke';
import {getOutput, Output} from './utils/getOutput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInvokableObservable<T, P extends any[]>(
  fn: Factory<T, P> | undefined,
  deps: Dependencies = [],
): Output<T> & {invoke: (...args: P) => void} {
  const mounted = useMounted();
  const subscription = useRef<Subscription | undefined>(undefined);
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(
    reducer,
    initialState,
  );

  // reset observable state whenever the dependencies change i.e. the result returned by the function will be a new observable
  useEffect(() => {
    dispatch(reset());
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = undefined;
      }
    };
  }, deps);

  return {
    ...getOutput(state),
    invoke: (...args: P) => {
      if (fn) {
        subscription.current = invoke<T, P>({fn, dispatch, mounted}, args);
      }
    },
  };
}
