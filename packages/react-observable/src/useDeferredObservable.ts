import {useCallback, useEffect, useRef, useState} from 'react';
import {Status, Factory, UnknownState, State} from './types';
import {
  createInvokableByFactoryByParamtersMap,
  Invokable,
  InvokableUbsubscribe,
} from './createInvokable';
import {Observable} from '@jameslnewell/observable';

const invokablesByFactoryByParametersMap = createInvokableByFactoryByParamtersMap();

export interface UseDeferredObservableOptions {
  suspendWhenWaiting?: boolean;
  throwWhenErrored?: boolean;
}

export type UseDeferredObservableResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...params: Parameters): void;
  invokeAsync(...params: Parameters): Observable<Value>;
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

      // TODO: reset state?
    },
    [factory],
  );

  const invokeAsync = useCallback(
    (...parameters: Parameters): Observable<Value> => {
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
    invokeAsync(...parameters);
  }, []);

  // create the result
  return {
    ...state,
    isWaiting: state.status === Status.Waiting,
    isReceived: state.status === Status.Received,
    isCompleted: state.status === Status.Completed,
    isErrored: state.status === Status.Errored,
    invoke,
    invokeAsync,
  };
}
