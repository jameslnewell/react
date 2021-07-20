import {useEffect} from 'react';
import {createLoadingState} from './state';
import {Observable} from 'rxjs';
import {
  useInvokableObservable,
  UseInvokableObservableResult,
} from './useInvokableObservable';

export type UseObservableResult<Value> = Omit<
  UseInvokableObservableResult<[], Value>,
  'invoke'
>;

export function useObservable<Value>(
  observable: Observable<Value> | undefined,
): UseObservableResult<Value> {
  const {invoke, ...result} = useInvokableObservable(
    observable ? () => observable : undefined,
    [observable],
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
