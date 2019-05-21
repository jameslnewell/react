// eslint-disable @typescript-eslint/explicit-function-return-type
import {useRef, useReducer, useEffect, Reducer, DependencyList} from 'react';

export enum Status {
  Loading = 'loading',
  Loaded = 'loaded',
  Errored = 'errored'
} 

export interface State<T> {
  status: Status | undefined;
  error: Error | undefined;
  data: T | undefined;
}

interface ResetAction {
  type: 'reset';
}

interface LoadingAction {
  type: Status.Loading;
}

interface LoadedAction<T> {
  type: Status.Loaded;
  data: T | undefined;
}

interface ErroredAction {
  type: Status.Errored;
  error: Error | undefined
}

export type Action<T> = ResetAction | LoadingAction | LoadedAction<T> | ErroredAction;

const initialState = {
  status: undefined,
  data: undefined,
  error: undefined
};

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'reset':
      return initialState;
    case Status.Loading:
      return {
        status: Status.Loading,
        data: undefined,
        error: undefined
      };;
    case Status.Loaded:
      return {
        status: Status.Loaded,
        data: action.data,
        error: undefined
      };
    case Status.Errored:
      return {
        status: Status.Errored,
        data: undefined,
        error: action.error
      };
    default:
      return state;
  }
}

function isPromise<T>(promise: Promise<T> | undefined): promise is Promise<T> {
  return typeof promise !== 'undefined' && typeof (promise as Promise<T>).then === 'function';
}

export default function usePromise<T>(fn: (() => Promise<T> | undefined), deps?: DependencyList): [Status | undefined, Error | undefined, T | undefined] {
  const isMounted = useRef(false);
  const [state, dispatch] = useReducer<Reducer<State<T>, Action<T>>>(reducer, initialState);

  useEffect((): () => void => {
    isMounted.current = true;
    const promise = fn();
    if (isPromise(promise)) {
      dispatch({type: Status.Loading})
      promise.then(
        (data): void => {
          if (isMounted.current) {
            dispatch({type: Status.Loaded, data});
          }
        },
        (error): void => {
          if (isMounted.current) {
            dispatch({type: Status.Errored, error});
          }
        }
      );
    } else {
      dispatch({type: 'reset'})
    }

    return (): void => {
      isMounted.current = false;
    }
  }, deps);

  return [state.status, state.error, state.data];
}
