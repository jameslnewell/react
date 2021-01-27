/**
 * @jest-environment node
 */
import {DependencyList, useCallback, useEffect, useRef, useState} from 'react';
import useIsMounted from '@jameslnewell/react-mounted';

export interface UseDeferredPromiseFactoryFunction<
  Value = unknown,
  Parameters extends unknown[] = []
> {
  (...params: Parameters): Promise<Value>;
}

export interface UseDeferredPromiseInvokeFunction<
  Parameters extends unknown[] = []
> {
  (...params: Parameters): void;
}

export interface UseDeferredPromiseInvokeAsyncFunction<
  Value = unknown,
  Parameters extends unknown[] = []
> {
  (...params: Parameters): Promise<Value>;
}

export interface UseDeferredPromiseDependencies extends DependencyList {}

export enum UseDeferredPromiseStatus {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface UseDeferredPromiseResult<
  Value = unknown,
  Parameters extends unknown[] = [],
  Error = unknown
> {
  status: UseDeferredPromiseStatus | undefined;
  value?: Value;
  error?: Error;
  invoke: UseDeferredPromiseInvokeFunction<Parameters>;
  invokeAsync: UseDeferredPromiseInvokeAsyncFunction<Value, Parameters>;
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
}

interface UseDeferredPromiseState<Value, Error> {
  status: UseDeferredPromiseStatus | undefined;
  value: Value | undefined;
  error: Error | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idleState: UseDeferredPromiseState<any, any> = {
  status: undefined,
  value: undefined,
  error: undefined,
};

export function useDeferredPromise<
  Value = unknown,
  Parameters extends unknown[] = [],
  Error = unknown
>(
  fn: UseDeferredPromiseFactoryFunction<Value, Parameters> | undefined,
  deps?: UseDeferredPromiseDependencies,
): UseDeferredPromiseResult<Value, Parameters, Error> {
  const isMounted = useIsMounted();
  const resolveFunction = useRef<(() => void) | undefined>(undefined);
  const mostRecentlyCreatedPromise = useRef<Promise<Value> | undefined>(
    undefined,
  );
  const [state, setState] = useState<UseDeferredPromiseState<Value, Error>>(
    idleState,
  );

  const invokeAsync = useCallback(
    async (...parameters: Parameters): Promise<Value> => {
      if (!fn) {
        throw new Error(
          "The invoke function cannot be called at this time because the factory didn't return a promise.",
        );
      }

      setState({
        status: UseDeferredPromiseStatus.Pending,
        value: undefined,
        error: undefined,
      });

      const thisPromise = (mostRecentlyCreatedPromise.current = fn(
        ...parameters,
      ));
      try {
        const value = await thisPromise;
        if (
          isMounted.current &&
          thisPromise === mostRecentlyCreatedPromise.current
        ) {
          setState({
            status: UseDeferredPromiseStatus.Fulfilled,
            value,
            error: undefined,
          });
          resolveFunction.current = undefined;
          mostRecentlyCreatedPromise.current = undefined;
        }
        return value;
      } catch (error) {
        if (
          isMounted.current &&
          thisPromise === mostRecentlyCreatedPromise.current
        ) {
          setState({
            status: UseDeferredPromiseStatus.Rejected,
            value: undefined,
            error,
          });
          resolveFunction.current = undefined;
          mostRecentlyCreatedPromise.current = undefined;
        }
        throw error;
      }
    },
    [...(deps ?? []), setState],
  );

  const invoke = useCallback(
    (...parameters: Parameters): void => {
      invokeAsync(...parameters).catch(() => {
        /* do nothing */
      });
    },
    [invokeAsync],
  );

  // reset the state whenever the invoke function is recreated
  useEffect(
    () => () => {
      setState(idleState);
    },
    [invoke],
  );

  return {
    ...state,
    invoke,
    invokeAsync,
    isPending: state.status === UseDeferredPromiseStatus.Pending,
    isFulfilled: state.status === UseDeferredPromiseStatus.Fulfilled,
    isRejected: state.status === UseDeferredPromiseStatus.Rejected,
  };
}
