import {useCallback, useEffect} from 'react';
import {createLoadingState} from './state';
import {
  useInvokablePromise,
  UseInvokablePromiseResult,
} from './useInvokablePromise';

export type UsePromiseResult<Value> = Omit<
  UseInvokablePromiseResult<[], Value>,
  'invoke'
>;

export function usePromise<Value>(
  promise: Promise<Value> | undefined,
): UsePromiseResult<Value> {
  const {invoke, ...result} = useInvokablePromise(
    useCallback(() => (promise ? promise : undefined), [promise]),
  );

  useEffect(() => {
    promise && invoke();
  }, [promise, invoke]);

  if (promise && result.status === undefined) {
    return {
      ...createLoadingState(),
      isLoading: true,
      isLoaded: false,
      isErrored: false,
    };
  } else {
    return result;
  }
}
