import {Dispatch, RefObject} from 'react';
import {Subscription} from '@jameslnewell/observable';
import {Factory} from '../types';
import {Action, observing, observed, errored, completed} from './Action';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invoke<T, P extends any[]>(
  {
    fn,
    dispatch,
    mounted,
  }: {
    fn: Factory<T, P>;
    dispatch: Dispatch<Action<T>>;
    mounted: RefObject<boolean>;
  },
  args: P,
): Subscription {
  dispatch(observing());
  const observable = fn(...args);
  return observable.subscribe({
    next: value => {
      if (mounted.current) {
        dispatch(observed(value));
      }
    },
    error: error => {
      if (mounted.current) {
        dispatch(errored(error));
      }
    },
    complete: () => {
      if (mounted.current) {
        dispatch(completed());
      }
    },
  });
}
