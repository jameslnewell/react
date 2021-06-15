import {
  EmptyState,
  ErroredState,
  LoadedState,
  LoadingState,
  Status,
} from './types';

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
