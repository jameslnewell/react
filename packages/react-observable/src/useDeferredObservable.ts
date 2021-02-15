import {useCallback, useEffect, useRef, useState} from 'react';
import {Status, Factory, UnknownState, State} from './types';
import {
  createInvokableByFactoryByParamtersMap,
  Invokable,
  InvokableUbsubscribe,
} from './createInvokable';
import {Observable} from '@jameslnewell/observable';

const invokablesByFactoryByParametersMap = createInvokableByFactoryByParamtersMap();

export type UseDeferredObservableDependencies = unknown[];

export interface UseDeferredObservableOptions {
  suspendWhenWaiting?: boolean;
  throwWhenErrored?: boolean;
}

export type UseDeferredObservableResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invokeSilently(...params: Parameters): void;
  invoke(...params: Parameters): Observable<Value>;
  isWaiting: boolean;
  isReceived: boolean;
  isCompleted: boolean;
  isErrored: boolean;
};

const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
};

export function useDeferredObservable<Parameters extends unknown[], Value>(
  factory: Factory<Parameters, Value> | undefined,
  deps: UseDeferredObservableDependencies,
  {
    suspendWhenWaiting = false,
    throwWhenErrored = false,
  }: UseDeferredObservableOptions = {},
): UseDeferredObservableResult<Parameters, Value> {
  const [state, setState] = useState<State<Value>>(unknownState);
  const invokableRef = useRef<Invokable<Value> | undefined>(undefined);
  const unsubscribeRef = useRef<InvokableUbsubscribe | undefined>(undefined);

  // suspend
  if (suspendWhenWaiting && state.status === Status.Waiting) {
    throw invokableRef.current?.getSuspender();
  }

  // throw
  if (throwWhenErrored && state.status === Status.Errored) {
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

      // TODO: reset state
    },
    deps,
  );

  const invoke = useCallback((...parameters: Parameters): Observable<Value> => {
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
  }, deps);

  const invokeSilently = useCallback(
    (...parameters: Parameters): void => {
      invoke(...parameters);
    },
    [invoke],
  );

  // create the result
  return {
    ...state,
    isWaiting: state.status === Status.Waiting,
    isReceived: state.status === Status.Received,
    isCompleted: state.status === Status.Completed,
    isErrored: state.status === Status.Errored,
    invokeSilently,
    invoke,
  };
}
