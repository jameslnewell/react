import {useCallback, useEffect, useRef, useState} from 'react';
import {Factory, State, Status} from './types';
import {InvokableManager} from './manager';
import {ReferenceCountedInvokableCache} from './cache';

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

export const hookCache = new ReferenceCountedInvokableCache();

export function useDeferredPromise<Value>(
  factory: Factory<[], Value> | undefined,
  {
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UseDeferredPromiseOptions = {},
): UseDeferredPromiseResult<[], Value> {
  const mountedRef = useRef(false);
  const managerRef = useRef<InvokableManager<[], Value> | undefined>(undefined);

  if (!managerRef.current) {
    managerRef.current = new InvokableManager(hookCache);
    if (factory) {
      managerRef.current.init(factory, []);
    }
  }

  const state = managerRef.current.getState();
  const [, setState] = useState(managerRef.current.getState());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  });

  useEffect(() => {
    managerRef.current?.subscribe((state) => {
      if (mountedRef.current) {
        setState(state);
      }
    });
  }, []);

  useEffect(
    () => () => {
      managerRef.current?.reset();
    },
    [factory],
  );

  const invoke = useCallback(async (): Promise<Value> => {
    if (!managerRef.current || !factory) {
      throw new Error('No factory provided.');
    }
    return managerRef.current.invoke(factory, []);
  }, [factory]);

  // suspend when pending
  if (suspendWhenPending && state?.status === Status.Pending) {
    throw managerRef.current?.getSuspender();
  }

  // throw when errored
  if (throwWhenRejected && state?.status === Status.Rejected) {
    throw state.error;
  }

  return {
    ...state,
    invoke,
  };
}
