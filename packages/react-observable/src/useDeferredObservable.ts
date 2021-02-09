import useMounted from '@jameslnewell/react-mounted';
import {useMemo, useRef, useState} from 'react';
import {Status, Factory} from './types';
import {Store, StoreState} from './Store';
import {invoke as _invoke_} from './utilities/invoke';

const globalStore = new Store();

export interface UseDeferredObservableOptions {
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
}

export type UseDeferredObservableResult<
  Parameters extends unknown[],
  Value
> = StoreState<Value> & {
  invoke(...params: Parameters): void;
  isWaiting: boolean;
  isReceived: boolean;
  isCompleted: boolean;
  isErrored: boolean;
};

export function useDeferredObservable<Parameters extends unknown[], Value>(
  factory: Factory<Parameters, Value> | undefined,
  {
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UseDeferredObservableOptions = {},
): UseDeferredObservableResult<Parameters, Value> {
  const mountedRef = useMounted();
  const unsubscribeRef = useRef<undefined | (() => void)>(undefined);
  const [state, setState] = useState<StoreState<Value>>(() => ({
    status: undefined,
    value: undefined,
    error: undefined,
    suspender: undefined,
  }));

  // suspend
  if (suspendWhenPending && state.status === Status.Waiting) {
    throw state.suspender;
  }

  // throw
  if (throwWhenRejected && state.status === Status.Errored) {
    throw state.error;
  }

  // create the result
  return useMemo<UseDeferredObservableResult<Parameters, Value>>(() => {
    const invoke = (...parameters: Parameters): Promise<Value> => {
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

    return {
      ...state,
      isWaiting: state.status === Status.Waiting,
      isReceived: state.status === Status.Received,
      isCompleted: state.status === Status.Completed,
      isErrored: state.status === Status.Errored,
      invoke,
    };
  }, [state]);
}
