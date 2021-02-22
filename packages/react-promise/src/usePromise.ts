import {Factory, State, Status} from './types';
import {useInvokable, UseInvokableOptions} from './useInvokable';

export interface UsePromiseOptions extends UseInvokableOptions {
  invokeWhenMounted?: boolean;
}

export type UsePromiseResult<Value> = State<Value> & {
  invoke(): Promise<Value>;
};

export function usePromise<Value>(
  keys: unknown[],
  factory: Factory<[], Value> | undefined,
  options?: UsePromiseOptions,
): UsePromiseResult<Value> {
  const {invokeWhenMounted = true, ...otherOptions} = options ?? {};
  const [state, invoke, suspender] = useInvokable(keys, factory, otherOptions);

  if (invokeWhenMounted && state.status === undefined && factory) {
    if (otherOptions.suspendWhenPending) {
      invoke();
      throw suspender;
    } else {
      invoke();
      return {
        ...state,
        invoke,
        status: Status.Pending,
        isPending: true,
      };
    }
  }

  return {
    ...state,
    invoke,
  };
}
