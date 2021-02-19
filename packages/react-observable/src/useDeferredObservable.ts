/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {useCallback, useEffect, useState} from 'react';
import {Factory, State, Status} from './types';
import {cache} from './cache';
import {createInvokable, Invokable} from './createInvokable';
import {Observable} from '@jameslnewell/observable';

export interface UseDeferredObservableOptions {
  suspendWhenWaiting?: boolean;
  throwWhenErrored?: boolean;
}

export type UseDeferredObservableResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...parameters: Parameters): Observable<Value>;
};

function shouldUpdateState<Value>(
  prevState: State<Value>,
  nextState: State<Value>,
): boolean {
  return (
    nextState !== prevState &&
    !(
      prevState.status === Status.Waiting && nextState.status === Status.Waiting
    )
  );
}

export function useDeferredObservable<Parameters extends unknown[], Value>(
  keys: unknown[],
  factory: Factory<Parameters, Value> | undefined,
  {suspendWhenWaiting, throwWhenErrored}: UseDeferredObservableOptions = {},
): UseDeferredObservableResult<Parameters, Value> {
  // get or create the invokable
  let invokable: Invokable<Parameters, Value> | undefined = cache.get(keys);
  if (!invokable) {
    invokable = createInvokable<Parameters, Value>();
    cache.set(keys, invokable);
    cache.reference(keys);
  }

  const state = invokable.state;
  const [, setState] = useState(state);

  const invoke = useCallback(
    (...parameters: Parameters): Observable<Value> => {
      if (!factory) {
        throw new Error('Unable to invoke. No factory provided.');
      }
      return invokable!.invoke(factory, parameters);
    },
    [invokable, factory],
  );

  useEffect(() => {
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
  if (suspendWhenWaiting && state.status === Status.Waiting) {
    throw invokable.suspender;
  }

  // throw when errored
  if (throwWhenErrored && state.status === Status.Errored) {
    throw state.error;
  }

  return {
    ...state,
    invoke,
  };
}
