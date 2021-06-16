import {Status} from './status';

export type EmptyState = {
  status: undefined;
  value: undefined;
  error: undefined;
};

export type LoadingState = {
  status: Status.Loading;
  value: undefined;
  error: undefined;
};

export type LoadedState<Value> = {
  status: Status.Loaded;
  value: Value;
  error: undefined;
};

export type ErroredState = {
  status: Status.Errored;
  value: undefined;
  error: unknown;
};

export function createEmptyState(): EmptyState {
  return {
    status: undefined,
    value: undefined,
    error: undefined,
  };
}

export function createLoadingState(): LoadingState {
  return {
    status: Status.Loading,
    value: undefined,
    error: undefined,
  };
}

export function createLoadedState<Value>(value: Value): LoadedState<Value> {
  return {
    status: Status.Loaded,
    value,
    error: undefined,
  };
}

export function createErroredState(error: unknown): ErroredState {
  return {
    status: Status.Errored,
    value: undefined,
    error,
  };
}
