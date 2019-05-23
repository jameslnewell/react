import {useRef, useReducer, useEffect, Reducer, DependencyList} from 'react';

export enum Status {
  Resolving = 'resolving',
  Resolved = 'resolved',
  Rejected = 'rejected',
}

export interface Factory<T> {
  (): Promise<T> | undefined;
}

export type FactoryDependencies = DependencyList;

interface State<T> {
  status: Status | undefined;
  error: Error | undefined;
  data: T | undefined;
}

interface ResetAction {
  type: 'reset';
}

interface ResolvingAction {
  type: Status.Resolving;
}

interface ResolvedAction<T> {
  type: Status.Resolved;
  data: T | undefined;
}

interface RejectedAction {
  type: Status.Rejected;
  error: Error | undefined;
}

export type Action<T> =
  | ResetAction
  | ResolvingAction
  | ResolvedAction<T>
  | RejectedAction;

const initialState = {
  status: undefined,
  data: undefined,
  error: undefined,
};

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'reset':
      return initialState;
    case Status.Resolving:
      return {
        status: Status.Resolving,
        data: undefined,
        error: undefined,
      };
    case Status.Resolved:
      return {
        status: Status.Resolved,
        data: action.data,
        error: undefined,
      };
    case Status.Rejected:
      return {
        status: Status.Rejected,
        data: undefined,
        error: action.error,
      };
    default:
      return state;
  }
}

function isPromise<T>(promise: Promise<T> | undefined): promise is Promise<T> {
  return (
    typeof promise !== 'undefined' &&
    typeof (promise as Promise<T>).then === 'function'
  );
}

export default function usePromise<T>(
  fn: Factory<T>,
  deps: DependencyList = [],
): [Status | undefined, Error | undefined, T | undefined] {
  const isMounted = useRef(false);
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(
    reducer,
    initialState,
  );

  useEffect((): (() => void) => {
    isMounted.current = true;
    const promise = fn();
    if (isPromise(promise)) {
      dispatch({type: Status.Resolving});
      promise.then(
        (data): void => {
          if (isMounted.current) {
            dispatch({type: Status.Resolved, data});
          }
        },
        (error): void => {
          if (isMounted.current) {
            dispatch({type: Status.Rejected, error});
          }
        },
      );
    } else {
      dispatch({type: 'reset'});
    }

    return (): void => {
      isMounted.current = false;
    };
  }, deps);

  return [state.status, state.error, state.data];
}
