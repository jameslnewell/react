import {Dispatch, RefObject} from 'react';
import {Subscription} from '@jameslnewell/observable';
import {Factory} from '../types';
import {Action, observing, observed, errored, completed} from './Action';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invoke<T, E, P extends any[]>(
  {
    fn,
    dispatch,
    isMounted,
  }: {
    fn: Factory<T, P>;
    dispatch: Dispatch<Action<T, E>>;
    isMounted: RefObject<boolean>;
  },
  args: P,
): Subscription {
  dispatch(observing());
  const observable = fn(...args);
  return observable.subscribe({
    next: value => {
      if (isMounted.current) {
        dispatch(observed(value));
      }
    },
    error: error => {
      if (isMounted.current) {
        dispatch(errored<E>(error));
      }
    },
    complete: () => {
      if (isMounted.current) {
        dispatch(completed());
      }
    },
  });
}
