import {Status} from './status';

export interface EmptyState {
  status: undefined;
  value: undefined;
  error: undefined;
}

export interface LoadingState {
  status: Status.Loading;
  value: undefined;
  error: undefined;
}

export interface LoadedState<Value> {
  status: Status.Loaded;
  value: Value;
  error: undefined;
}

export interface ErroredState {
  status: Status.Errored;
  value: undefined;
  error: unknown;
}

export interface EmptyStateResult extends EmptyState {
  isLoading: false;
  isLoaded: false;
  isErrored: false;
}

export interface LoadingStateResult extends LoadingState {
  isLoading: true;
  isLoaded: false;
  isErrored: false;
}

export interface LoadedStateResult<Value> extends LoadedState<Value> {
  isLoading: false;
  isLoaded: true;
  isErrored: false;
}

export interface ErroredStateResult extends ErroredState {
  isLoading: false;
  isLoaded: false;
  isErrored: true;
}

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
