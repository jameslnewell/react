import {useReducer, useEffect, Reducer, useRef} from 'react';
import {Subscription} from '@jameslnewell/observable';
import {Factory, Dependencies, Status, Metadata} from './types';
import {State} from './utils/State';
import {Action, reset} from './utils/Action';
import {useMounted} from './utils/useMounted';
import {reducer} from './utils/reducer';
import {initialState} from './utils/initialState';
import {invoke} from './utils/invoke';
import {getMetadata} from './utils/getMetadata';

export {Status as UseObservableStatus};
export type UseObservableFactory<T> = Factory<T, []>;
export type UseObservableDependencies = Dependencies;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UseObservableMetadata<E = any> = Metadata<E>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useObservable<T, E = any>(
  fn: UseObservableFactory<T> | undefined,
  deps: UseObservableDependencies = [],
): [T | undefined, UseObservableMetadata] {
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
