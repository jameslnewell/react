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
import {Observable, Subscription} from 'rxjs';
import {useWarnIfValueChangesFrequently} from './useWarnIfValueChangesFrequently';

type UseInvokableObservableState<Value> =
  | EmptyState
  | LoadingState
  | LoadedState<Value>
  | ErroredState;

export type UseInvokableObservableResult<Value> =
  UseInvokableObservableState<Value> & {
    invoke: () => Observable<Value>;
  };

export function useInvokableObservable<Params extends [], Value>(
  factory: (...params: Params) => Observable<Value>,
): UseInvokableObservableResult<Value> {
  const subscriptionRef = useRef<Subscription | undefined>(undefined);
  const [state, setState] =
    useState<UseInvokableObservableState<Value>>(createEmptyState);

  const invoke = useCallback(
    (...params: Params) => {
      // unsubscribe from previous subscription
      subscriptionRef.current?.unsubscribe();

      // subscribe to next subscription
      setState(createLoadingState());
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
    },
    [factory, setState],
  );

  // unsubscribe and reset state when the observable factory changes
  useEffect(() => {
    return () => {
      subscriptionRef.current?.unsubscribe();
      setState(createEmptyState());
    };
  }, [factory]);

  if (process.env.NODE_ENV === 'development') {
    useWarnIfValueChangesFrequently(
      factory,
      'It seems like you might be creating and passing a new factory function on each render. ' +
        'Create the factory function outside of the render function or wrap it with React.useCallback()',
    );
  }

  return useMemo(
    () => ({
      ...state,
      invoke,
    }),
    [state, invoke],
  );
}
