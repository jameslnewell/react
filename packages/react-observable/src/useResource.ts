import {Resource, State, Status} from './Resource';
import useMounted from '@jameslnewell/react-mounted';
import {useEffect, useMemo, useState} from 'react';

export interface UseResourceOptions {
  suspendWhenWaiting?: boolean;
  throwWhenErrored?: boolean;
}

export type UseResourceResult<Value, Error> = State<Value, Error> & {
  isWaiting: boolean;
  isReceived: boolean;
  isCompleted: boolean;
  isErrored: boolean;
};

export function useResource<Parameters extends unknown[], Value, Error>(
  resource: Resource<Parameters, Value, Error>,
  {suspendWhenWaiting = true, throwWhenErrored = true}: UseResourceOptions = {},
): UseResourceResult<Value, Error> {
  const mounted = useMounted();
  const [state, setState] = useState(() => resource?.state);

  // suspend
  if (suspendWhenWaiting && state.status === Status.Waiting) {
    throw resource.wait();
  }

  // throw
  if (throwWhenErrored && state.status === Status.Errored) {
    throw state.error;
  }

  // subscribe to state updates
  useEffect(() => {
    return resource?.subscribe((state) => {
      if (mounted.current) {
        setState(state);
      }
    });

    // TODO: unsubscribe
  }, [resource]);

  // create the result
  return useMemo<UseResourceResult<Value, Error>>(
    () => ({
      ...state,
      isWaiting: state.status === Status.Waiting,
      isReceived: state.status === Status.Receieved,
      isCompleted: state.status === Status.Completed,
      isErrored: state.status === Status.Errored,
    }),
    [state],
  );
}
