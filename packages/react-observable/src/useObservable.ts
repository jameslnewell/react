import {useEffect, useCallback} from 'react';
import {
  ErroredState,
  LoadedState,
  LoadingState,
  createLoadingState,
} from './state';
import {Observable} from 'rxjs';
import {useWarnIfValueChangesFrequently} from './useWarnIfValueChangesFrequently';
import {useInvokableObservable} from './useInvokableObservable';

export type UseObservableResult<Value> =
  | LoadingState
  | LoadedState<Value>
  | ErroredState;

export function useObservable<Value>(
  observable: Observable<Value>,
): UseObservableResult<Value> {
  if (process.env.NODE_ENV === 'development') {
    useWarnIfValueChangesFrequently(
      observable,
      'It seems like you might be creating and passing a new observable on each render. ' +
        'Create the observable outside of the render function or wrap it with React.useMemo()',
    );
  }

  const factory = useCallback(() => observable, [observable]);
  const {invoke, ...state} = useInvokableObservable(factory);

  useEffect(() => {
    invoke();
  }, [invoke]);

  if (state.status === undefined) {
    return createLoadingState();
  } else {
    return state;
  }
}
