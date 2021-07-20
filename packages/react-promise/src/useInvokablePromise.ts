import {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {
  EmptyState,
  LoadingState,
  LoadedState,
  ErroredState,
  createEmptyState,
  createErroredState,
  createLoadedState,
  createLoadingState,
  EmptyStateResult,
  LoadedStateResult,
  LoadingStateResult,
  ErroredStateResult,
} from './state';
import {Status} from './status';

type UseInvokablePromiseState<Value> =
  | EmptyState
  | LoadingState
  | LoadedState<Value>
  | ErroredState;

export type UseInvokablePromiseResult<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Params extends any[],
  Value,
> = (
  | EmptyStateResult
  | LoadingStateResult
  | LoadedStateResult<Value>
  | ErroredStateResult
) & {
  invoke: (...params: Params) => Promise<Value>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInvokablePromise<Params extends any[], Value>(
  factory: ((...params: Params) => Promise<Value>) | undefined,
  deps: unknown[],
): UseInvokablePromiseResult<Params, Value> {
  const current = useRef<Promise<Value> | undefined>(undefined);
  const [state, setState] =
    useState<UseInvokablePromiseState<Value>>(createEmptyState);

  const invoke = useCallback(
    (...params: Params) => {
      setState(createLoadingState());
      if (factory) {
        const promise = factory(...params);
        current.current = promise;
        promise.then(
          (value) => {
            if (current.current) {
              setState(createLoadedState(value));
            }
          },
          (error) => {
            if (current.current) {
              setState(createErroredState(error));
            }
          },
        );
        return promise;
      } else {
        throw new Error('No factory to invoke.');
      }
    },
    [setState, ...deps],
  );

  // unsubscribe and reset state when the promise factory changes
  useEffect(() => {
    return () => {
      current.current = undefined;
      setState(createEmptyState());
    };
  }, deps);

  return useMemo(() => {
    return {
      ...state,
      invoke,
      isLoading: state.status === Status.Loading,
      isLoaded: state.status === Status.Loaded,
      isErrored: state.status === Status.Errored,
    } as UseInvokablePromiseResult<Params, Value>;
  }, [state, invoke]);
}
