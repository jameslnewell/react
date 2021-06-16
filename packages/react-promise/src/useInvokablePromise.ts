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
} from './state';
import {useWarnIfValueChangesFrequently} from './useWarnIfValueChangesFrequently';

type UseInvokablePromiseState<Value> =
  | EmptyState
  | LoadingState
  | LoadedState<Value>
  | ErroredState;

export type UseInvokablePromiseResult<
  Params extends [],
  Value,
> = UseInvokablePromiseState<Value> & {
  invoke: (...params: Params) => Promise<Value>;
};

export function useInvokablePromise<Params extends [], Value>(
  factory: (...params: Params) => Promise<Value>,
): UseInvokablePromiseResult<Params, Value> {
  if (process.env.NODE_ENV === 'development') {
    useWarnIfValueChangesFrequently(
      factory,
      'It seems like you might be creating and passing a new factory function on each render. ' +
        'Create the factory function outside of the render function or wrap it with React.useCallback()',
    );
  }

  const current = useRef<Promise<Value> | undefined>(undefined);
  const [state, setState] =
    useState<UseInvokablePromiseState<Value>>(createEmptyState);

  const invoke = useCallback(
    (...params: Params) => {
      setState(createLoadingState());
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
    },
    [factory, setState],
  );

  // unsubscribe and reset state when the promise factory changes
  useEffect(() => {
    return () => {
      current.current = undefined;
      setState(createEmptyState());
    };
  }, [factory]);

  return useMemo(
    () => ({
      ...state,
      invoke,
    }),
    [state, invoke],
  );
}
