import {useCallback, useEffect, useRef, useState} from 'react';
import {Factory, State, Status, UnknownState} from './types';
import {createInvokableCache} from './createInvokableCache';
import {createInvokable, Invokable} from './createInvokable';

export interface UseDeferredPromiseOptions {
  enabled?: boolean;
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
}

export type UseDeferredPromiseResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...parameters: Parameters): Promise<Value>;
};

const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
  isPending: false,
  isFulfilled: false,
  isRejected: false,
};

const cache = createInvokableCache();

export function useDeferredPromise<Parameters extends unknown[], Value>(
  keys: unknown[],
  factory: Factory<Parameters, Value> | undefined,
  {suspendWhenPending, throwWhenRejected}: UseDeferredPromiseOptions = {},
): UseDeferredPromiseResult<Parameters, Value> {
  const mountedRef = useRef(false);
  let invokable: Invokable<Parameters, Value> | undefined = cache.get(keys);
  if (!invokable) {
    invokable = createInvokable<Parameters, Value>();
    cache.set(keys, invokable);
  }

  const state = invokable.state || unknownState;
  const [, setState] = useState(state);

  // suspend when pending
  if (suspendWhenPending && state.status === Status.Pending) {
    throw invokable.suspender;
  }

  // throw when errored
  if (throwWhenRejected && state.status === Status.Rejected) {
    throw state.error;
  }

  const invoke = useCallback((...parameters: Parameters): Promise<Value> => {
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
        // avoid unnecessary state changes e.g. usePromse invoke on render
        if (
          state.status === Status.Pending &&
          nextState.status === Status.Pending
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
