/**
 * @jest-environment node
 */
import {useCallback, useEffect, useRef, useState} from 'react';
import {client} from './xClient';
import useIsMounted from '@jameslnewell/react-mounted';
import {Factory, Result, Status} from './types';

export interface UseDeferredPromiseOptions {
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
}

interface State<Parameters, Value, Error> {
  status: Status | undefined;
  value: Value | undefined;
  error: Error | undefined;
  params: Parameters | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idleState: State<any, any, any> = {
  status: undefined,
  value: undefined,
  error: undefined,
  params: undefined,
};

export function useDeferredPromise<
  Parameters extends unknown[] = [],
  Value = unknown,
  Error = unknown
>(
  fn: Factory<Parameters, Value> | undefined,
  {
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UseDeferredPromiseOptions = {},
): Result<Parameters, Value, Error> {
  const isMounted = useIsMounted();
  const mostRecentlyInvokedPromise = useRef<Promise<Value> | undefined>(
    undefined,
  );
  const [state, setState] = useState<State<Parameters, Value, Error>>(
    idleState,
  );

  if (fn && state.params && suspendWhenPending) {
    client.suspendWhenPending(fn, state.params);
  }

  if (fn && state.params && throwWhenRejected) {
    client.throwWhenRejected(fn, state.params);
  }

  const invokeAsync = useCallback(
    (...params: Parameters): Promise<Value> => {
      if (!fn) {
        throw new Error(
          "The invoke function cannot be called at this time because the factory didn't return a promise.",
        );
      }

      setState({
        status: Status.Pending,
        value: undefined,
        error: undefined,
        params: params || [],
      });

      const promise = (mostRecentlyInvokedPromise.current = client
        .invoke(fn, params || [], {force: true})
        .then(
          (value) => {
            if (
              isMounted.current &&
              promise === mostRecentlyInvokedPromise.current
            ) {
              setState((prevState) => ({
                ...prevState,
                status: Status.Fulfilled,
                value,
                error: undefined,
              }));
              mostRecentlyInvokedPromise.current = undefined;
            }
            return value;
          },
          (error) => {
            if (
              isMounted.current &&
              promise === mostRecentlyInvokedPromise.current
            ) {
              setState((prevState) => ({
                ...prevState,
                status: Status.Rejected,
                value: undefined,
                error,
              }));
              mostRecentlyInvokedPromise.current = undefined;
            }
            throw error;
          },
        ));

      return promise;
    },
    [fn, setState],
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

  // clean up the previous state when it changes
  useEffect(
    () => () => {
      if (fn && state.params) {
        client.clear(fn, state.params);
      }
    },
    [fn, state.params],
  );

  return {
    status: state.status,
    value: state.value,
    error: state.error,
    invoke,
    invokeAsync,
    isPending: state.status === Status.Pending,
    isFulfilled: state.status === Status.Fulfilled,
    isRejected: state.status === Status.Rejected,
  };
}
