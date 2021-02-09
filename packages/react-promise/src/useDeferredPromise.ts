import useMounted from '@jameslnewell/react-mounted';
import {useMemo, useRef, useState} from 'react';
import {Status, Factory, UnknownState} from './types';
import {Store, StoreState} from './Store';
import {invoke as _invoke_} from './utilities/invoke';

const globalStore = new Store();

export interface UseDeferredPromiseOptions {
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
}

export type UseDeferredPromiseResult<
  Parameters extends unknown[],
  Value
> = StoreState<Value> & {
  invoke(...params: Parameters): void;
  invokeAsync(...params: Parameters): Promise<Value>;
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
};

const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
  suspender: undefined,
};

export function useDeferredPromise<Parameters extends unknown[], Value>(
  factory: Factory<Parameters, Value> | undefined,
  {
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UseDeferredPromiseOptions = {},
): UseDeferredPromiseResult<Parameters, Value> {
  const mountedRef = useMounted();
  const unsubscribeRef = useRef<undefined | (() => void)>(undefined);
  const [state, setState] = useState<StoreState<Value>>(unknownState);

  // suspend
  if (suspendWhenPending && state.status === Status.Pending) {
    throw state.suspender;
  }

  // throw
  if (throwWhenRejected && state.status === Status.Rejected) {
    throw state.error;
  }

  // create the result
  return useMemo<UseDeferredPromiseResult<Parameters, Value>>(() => {
    const invokeAsync = (...parameters: Parameters): Promise<Value> => {
      const key = [factory, ...parameters];

      if (!factory) {
        throw new Error('No factory provided.');
      }
      // unsubscribe from state updates
      unsubscribeRef.current?.();

      // invoke the promise
      const result = _invoke_<Parameters, Value>({
        store: globalStore,
        key,
        factory,
        parameters,
      });

      // subscribe to state updates
      unsubscribeRef.current = globalStore.subscribe<Value>(key, (state) => {
        if (!mountedRef.current) {
          return;
        }
        setState(state);
      });

      return result;
    };

    const invoke = (...parameters: Parameters): void => {
      invokeAsync(...parameters).catch(() => {
        /* do nothing */
      });
    };

    return {
      ...state,
      isPending: state.status === Status.Pending,
      isFulfilled: state.status === Status.Fulfilled,
      isRejected: state.status === Status.Rejected,
      invoke,
      invokeAsync,
    };
  }, [state]);
}
