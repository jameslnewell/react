import {Observable} from '@jameslnewell/observable';
import {Factory, State, Status} from './types';
import {useInvokable, UseInvokableOptions} from './useInvokable';

export interface UseObservableOptions extends UseInvokableOptions {
  invokeWhenMounted?: boolean;
}

export type UseObservableResult<Value> = State<Value> & {
  invoke(): Observable<Value>;
};

export function useObservable<Value>(
  keys: unknown[],
  factory: Factory<[], Value> | undefined,
  options?: UseObservableOptions,
): UseObservableResult<Value> {
  const {invokeWhenMounted = true, ...otherOptions} = options ?? {};
  const [state, invoke, suspender] = useInvokable(keys, factory, otherOptions);

  if (invokeWhenMounted && state.status === undefined && factory) {
    if (otherOptions.suspendWhenWaiting) {
      invoke();
      throw suspender;
    } else {
      invoke();
      return {
        ...state,
        invoke,
        status: Status.Waiting,
        isWaiting: true,
      };
    }
  }

  return {
    ...state,
    invoke,
  };
}
