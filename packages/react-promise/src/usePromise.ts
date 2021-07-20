import {useEffect} from 'react';
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
    promise ? () => promise : undefined,
    [promise],
  );

  useEffect(() => {
    invoke();
  }, [invoke]);

  if (result.status === undefined) {
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
