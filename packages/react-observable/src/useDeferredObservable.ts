import {useCallback, useEffect, useRef, useState} from 'react';
import {Factory, State, Status, UnknownState} from './types';
import {cache} from './cache';
import {createInvokable, Invokable} from './createInvokable';
import {Observable} from '@jameslnewell/observable';

export interface UseDeferredObservableOptions {
  enabled?: boolean;
  suspendWhenWaiting?: boolean;
  throwWhenErrored?: boolean;
}

export type UseDeferredObservableResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...parameters: Parameters): Observable<Value>;
};

const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
  isWaiting: false,
  isReceived: false,
  isCompleted: false,
  isErrored: false,
};

export function useDeferredObservable<Parameters extends unknown[], Value>(
  keys: unknown[],
  factory: Factory<Parameters, Value> | undefined,
  {suspendWhenWaiting, throwWhenErrored}: UseDeferredObservableOptions = {},
): UseDeferredObservableResult<Parameters, Value> {
  const mountedRef = useRef(false);
  let invokable: Invokable<Parameters, Value> | undefined = cache.get(keys);
  if (!invokable) {
    invokable = createInvokable<Parameters, Value>();
    cache.set(keys, invokable);
  }

  const state = invokable.state || unknownState;
  const [, setState] = useState(state);

  // suspend when pending
  if (suspendWhenWaiting && state.status === Status.Waiting) {
    throw invokable.suspender;
  }

  // throw when errored
  if (throwWhenErrored && state.status === Status.Errored) {
    throw state.error;
  }

  const invoke = useCallback((...parameters: Parameters): Observable<Value> => {
    if (!factory) {
      throw new Error('Unable to invoke. No factory provided.');
    }
    if (!invokable) {
      throw new Error(
        'Something is wrong, the invokable should never be undefined!',
      );
    }
    return invokable.invoke(factory, parameters);
  }, keys);

  // keep track of whether the component is mounted
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  });

  // update the state when the invokable state changes and the component is mounted
  useEffect(() => {
    return invokable?.subscribe((nextState) => {
      if (mountedRef.current) {
        // avoid unnecessary state changes e.g. useObservable invoke on render
        if (
          state.status === Status.Waiting &&
          nextState.status === Status.Waiting
        ) {
          return;
        }
        setState(nextState);
      }
    });
  }, [invokable]);

  // garbage collect from cache when the key cahnges
  useEffect(
    () => () => {
      setState(unknownState);
      cache.dereference(keys);
    },
    keys,
  );

  return {
    ...state,
    invoke,
  };
}
