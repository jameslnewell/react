import {Dispatch, RefObject} from 'react';
import {Action, resolving, resolved, rejected} from './Action';

export async function track<T>(
  promise: Promise<T>,
  dispatch: Dispatch<Action<T>>,
  isMounted: RefObject<boolean>,
): Promise<void> {
  dispatch(resolving());
  try {
    const data = await promise;
    if (isMounted.current) {
      dispatch(resolved(data));
    }
  } catch (error) {
    if (isMounted.current) {
      dispatch(rejected(error));
    }
  }
}
