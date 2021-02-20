/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {useCallback, useEffect, useState} from 'react';
import {Factory, State, Status} from './types';
import {cache} from './cache';
import {createInvokable, Invokable} from './createInvokable';

export interface UseDeferredPromiseOptions {
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
}

export type UseDeferredPromiseResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...parameters: Parameters): Promise<Value>;
};

function shouldUpdateState<Value>(
  prevState: State<Value>,
  nextState: State<Value>,
): boolean {
  return (
    nextState !== prevState ||
    !(
      prevState.status === Status.Pending && nextState.status === Status.Pending
    )
  );
}

export function useDeferredPromise<Parameters extends unknown[], Value>(
  keys: unknown[],
  factory: Factory<Parameters, Value> | undefined,
  {suspendWhenPending, throwWhenRejected}: UseDeferredPromiseOptions = {},
): UseDeferredPromiseResult<Parameters, Value> {
  // get or create the invokable
  let invokable: Invokable<Parameters, Value> | undefined = cache.get(keys);
  if (!invokable) {
    invokable = createInvokable<Parameters, Value>();
    cache.set(keys, invokable);
  }

  const state = invokable.state;
  const [, setState] = useState(state);

  const invoke = useCallback(
    (...parameters: Parameters): Promise<Value> => {
      if (!factory) {
        throw new Error('Unable to invoke. No factory provided.');
      }
      return invokable!.invoke(factory, parameters);
    },
    [invokable, factory],
  );

  // update the state when the invokable state changes and the component is mounted
  useEffect(() => {
    // reference the object in cache so it doesn't get removed by this instance
    // when its referenced in multiple places
    cache.reference(keys);

    // update state now because state may have changed between render and mount
    setState((prevState) => {
      const nextState = invokable!.state;
      if (shouldUpdateState(prevState, nextState)) {
        return nextState;
      } else {
        return prevState;
      }
    });

    // update state when notified
    const unsubscribe = invokable!.subscribe((nextState) => {
      setState((prevState) => {
        if (shouldUpdateState(prevState, nextState)) {
          return nextState;
        } else {
          return prevState;
        }
      });
    });

    return () => {
      unsubscribe();
      cache.dereference(keys);
    };
  }, [...keys, invokable]);

  // suspend when pending
  if (suspendWhenPending && state.status === Status.Pending) {
    throw invokable.suspender;
  }

  // throw when errored
  if (throwWhenRejected && state.status === Status.Rejected) {
    throw state.error;
  }

  return {
    ...state,
    invoke,
  };
}
