import {useCallback, useEffect, useRef, useState} from 'react';
import {Status, Factory, UnknownState, State} from './types';
import {
  createInvokableByFactoryByParamtersMap,
  Invokable,
  InvokableUbsubscribe,
} from './createInvokable';

const invokablesByFactoryByParametersMap = createInvokableByFactoryByParamtersMap();

export interface UseDeferredPromiseOptions {
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
}

export type UseDeferredPromiseResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...params: Parameters): void;
  invokeAsync(...params: Parameters): Promise<Value>;
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
};

const noop = (): void => {
  /* do nothing */
};

const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
};

export function useDeferredPromise<Parameters extends unknown[], Value>(
  factory: Factory<Parameters, Value> | undefined,
  {
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UseDeferredPromiseOptions = {},
): UseDeferredPromiseResult<Parameters, Value> {
  const [state, setState] = useState<State<Value>>(unknownState);
  const invokableRef = useRef<Invokable<Value> | undefined>(undefined);
  const unsubscribeRef = useRef<InvokableUbsubscribe | undefined>(undefined);

  // suspend
  if (suspendWhenPending && state.status === Status.Pending) {
    throw invokableRef.current?.getSuspender();
  }

  // throw
  if (throwWhenRejected && state.status === Status.Rejected) {
    throw state.error;
  }

  // unsubscribe from the invokable when the factory changes or we unmount
  useEffect(
    () => () => {
      // unsubscribe if we're subscribed
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }

      // clear the invokable
      invokableRef.current = undefined;

      // TODO: reset state?
    },
    [factory],
  );

  const invokeAsync = useCallback(
    (...parameters: Parameters): Promise<Value> => {
      if (!factory) {
        throw new Error('No factory provided.');
      }

      // unsubscribe if we're subscribed
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }

      // get the invokable
      invokableRef.current = invokablesByFactoryByParametersMap
        .get(factory)
        .get(parameters);

      // invoke the invokable
      const result = invokableRef.current.invoke();

      // subscribe to the invokable
      unsubscribeRef.current = invokableRef.current.subscribe((newState) =>
        setState(newState || unknownState),
      );

      return result;
    },
    [],
  );

  const invoke = useCallback((...parameters: Parameters): void => {
    invokeAsync(...parameters).catch(noop);
  }, []);

  // create the result
  return {
    ...state,
    isPending: state.status === Status.Pending,
    isFulfilled: state.status === Status.Fulfilled,
    isRejected: state.status === Status.Rejected,
    invoke,
    invokeAsync,
  };
}
