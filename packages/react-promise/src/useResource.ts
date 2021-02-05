import {Resource, State, Status} from './createResource';
import useMounted from '@jameslnewell/react-mounted';
import {useEffect, useMemo, useState} from 'react';

export interface UseResourceOptions {
  suspendWhenPending?: boolean;
  throwWhenRejected?: boolean;
}

export type UseResourceResult<Value, Error> = State<Value, Error> & {
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
};

export function useResource<Parameters extends unknown[], Value, Error>(
  resource: Resource<Parameters, Value, Error>,
  {
    suspendWhenPending = true,
    throwWhenRejected = true,
  }: UseResourceOptions = {},
): UseResourceResult<Value, Error> {
  const mounted = useMounted();
  const [state, setState] = useState(() => resource.state);

  // suspend
  if (suspendWhenPending && state.status === Status.Pending) {
    throw resource.wait();
  }

  // throw
  if (throwWhenRejected && state.status === Status.Rejected) {
    throw state.error;
  }

  // subscribe to state updates
  useEffect(() => {
    return resource?.subscribe((state) => {
      if (mounted.current) {
        setState(state);
      }
    });
  }, [resource]);

  // create the result
  return useMemo<UseResourceResult<Value, Error>>(
    () => ({
      ...state,
      isPending: state.status === Status.Pending,
      isFulfilled: state.status === Status.Fulfilled,
      isRejected: state.status === Status.Rejected,
    }),
    [state],
  );
}
