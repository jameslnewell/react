import {useReducer, useEffect, Reducer, useRef} from 'react';
import {Subscription} from '@jameslnewell/observable';
import {Factory, Dependencies, Metadata} from './types';
import {State} from './utils/State';
import {Action, reset} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {invoke} from './utils/invoke';
import {getMetadata} from './utils/getMetadata';

export function useObservable<T, E>(
  fn: Factory<T, []> | undefined,
  deps: Dependencies = [],
): [T | undefined, Metadata<E>] {
  const isMounted = useMounted();
  const subscription = useRef<Subscription | undefined>(undefined);
  const [state, dispatch] = useReducer<Reducer<State<T, E>, Action<T, E>>>(
    reducer,
    initialState,
  );

  useEffect(() => {
    if (fn) {
      subscription.current = invoke({fn, dispatch, isMounted}, []);
    } else {
      dispatch(reset());
    }
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = undefined;
      }
    };
  }, deps);

  return [state.value, getMetadata(state)];
}
