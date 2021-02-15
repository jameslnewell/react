import {useCallback, useEffect, useRef, useState} from 'react';
import {Factory, State, Status} from './types';
import {InvokableManager} from './manager';
import {ReferenceCountedInvokableCache} from './cache';

export interface UsePromiseOptions {
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
  invokeWhenMounted?: boolean;
}

export type UsePromiseResult<
  Parameters extends unknown[],
  Value
> = State<Value> & {
  invoke(...parameters: Parameters): Promise<Value>;
};

const noop = (): void => {
  /* do nothing */
};

export const hookCache = new ReferenceCountedInvokableCache();

export function usePromise<Value>(
  factory: Factory<[], Value> | undefined,
  {
    invokeWhenMounted = true,
    suspendWhenPending = false,
    throwWhenRejected = false,
  }: UsePromiseOptions = {},
): UsePromiseResult<[], Value> {
  const mountedRef = useRef(false);
  const managerRef = useRef<InvokableManager<[], Value> | undefined>(undefined);

  if (!managerRef.current) {
    managerRef.current = new InvokableManager(hookCache);
    if (factory) {
      managerRef.current.init(factory, []);
    }
  }

  let state = managerRef.current.getState();
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

  if (invokeWhenMounted && state.status === undefined) {
    if (suspendWhenPending) {
      throw invoke();
    } else {
      invoke().then(noop, noop);
    }
    state = managerRef.current.getState();
  }

  return {
    ...state,
    invoke,
  };
}
