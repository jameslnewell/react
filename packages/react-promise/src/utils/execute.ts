/* eslint-disable @typescript-eslint/no-explicit-any */
import {Dispatch, RefObject, MutableRefObject} from 'react';
import {Factory} from '../types';
import {Action, pending, fulfilled, rejected} from './Action';

export interface ExecuteOptions<T, E, P extends any[]> {
  fn: Factory<T, P>;
  dispatch: Dispatch<Action<T, E>>;
  isMounted: RefObject<boolean>;
  current: MutableRefObject<Promise<any> | undefined>;
}

export async function execute<T, E, P extends any[]>(
  {fn, dispatch, isMounted, current}: ExecuteOptions<T, E, P>,
  args: P,
): Promise<T> {
  dispatch(pending());
  const promise = (current.current = fn(...args));
  try {
    const data = await promise;
    // only handle if we're not mounted or this is a previous promise resolving
    if (isMounted.current && current.current === promise) {
      dispatch(fulfilled(data));
    }
  } catch (error) {
    // only handle if we're not mounted or this is a previous promise rejecting
    if (isMounted.current && current.current === promise) {
      dispatch(rejected(error));
    }
  }
  return current.current;
}
