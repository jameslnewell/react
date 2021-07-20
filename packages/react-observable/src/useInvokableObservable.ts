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
  LoadingStateResult,
  LoadedStateResult,
  ErroredStateResult,
} from './state';
import {Observable, Subscription} from 'rxjs';
import {Status} from './status';

type UseInvokableObservableState<Value> =
  | EmptyState
  | LoadingState
  | LoadedState<Value>
  | ErroredState;

export type UseInvokableObservableResult<Params extends [], Value> = (
  | EmptyStateResult
  | LoadingStateResult
  | LoadedStateResult<Value>
  | ErroredStateResult
) & {
  invoke: (...parans: Params) => Observable<Value>;
};

export function useInvokableObservable<Params extends [], Value>(
  factory: ((...params: Params) => Observable<Value>) | undefined,
  deps: unknown[],
): UseInvokableObservableResult<Params, Value> {
  const subscriptionRef = useRef<Subscription | undefined>(undefined);
  const [state, setState] =
    useState<UseInvokableObservableState<Value>>(createEmptyState);

  const invoke = useCallback(
    (...params: Params) => {
      // unsubscribe from previous subscription
      subscriptionRef.current?.unsubscribe();

      // subscribe to next subscription
      setState(createLoadingState());
      if (factory) {
        let hasReceivedAValue = false;
        const observable = factory(...params);
        subscriptionRef.current = observable.subscribe({
          next(value) {
            hasReceivedAValue = true;
            setState(createLoadedState(value));
          },
          complete() {
            if (!hasReceivedAValue) {
              setState(
                createErroredState(
                  new Error('Observable completed without a value.'),
                ),
              );
            }
          },
          error(error) {
            setState(createErroredState(error));
          },
        });
        // TODO: replay events for the returned stream?
        return observable;
      } else {
        throw new Error('No factory to invoke.');
      }
    },
    [setState, ...deps],
  );

  // unsubscribe and reset state when the observable factory changes
  useEffect(() => {
    return () => {
      subscriptionRef.current?.unsubscribe();
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
    } as UseInvokableObservableResult<Params, Value>;
  }, [state, invoke]);
}
