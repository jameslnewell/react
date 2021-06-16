import {useEffect, useCallback} from 'react';
import {
  ErroredState,
  LoadedState,
  LoadingState,
  createLoadingState,
} from './state';
import {useWarnIfValueChangesFrequently} from './useWarnIfValueChangesFrequently';
import {useInvokablePromise} from './useInvokablePromise';

export type UsePromiseResult<Value> =
  | LoadingState
  | LoadedState<Value>
  | ErroredState;

export function usePromise<Value>(
  promise: Promise<Value>,
): UsePromiseResult<Value> {
  if (process.env.NODE_ENV === 'development') {
    useWarnIfValueChangesFrequently(
      promise,
      'It seems like you might be creating and passing a new promise on each render. ' +
        'Create the promise outside of the render function or wrap it with React.useMemo()',
    );
  }

  const factory = useCallback(() => promise, [promise]);
  const {invoke, ...state} = useInvokablePromise(factory);

  useEffect(() => {
    invoke();
  }, [invoke]);

  if (state.status === undefined) {
    return createLoadingState();
  } else {
    return state;
  }
}
