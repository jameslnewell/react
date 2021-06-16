import {Status} from './status';
import {
  ErroredState,
  LoadedState,
  LoadingState,
  createErroredState,
  createLoadedState,
  createLoadingState,
} from './state';

type ResourceState<Value> = LoadingState | LoadedState<Value> | ErroredState;

export interface ResourceObserver<Value = unknown> {
  (state: ResourceState<Value>): void;
}

export interface Resource<Value = unknown> {
  read(): Value;
}

export function createResource<Value = unknown>(
  promise: Promise<Value>,
): Resource<Value> {
  let state: ResourceState<Value> = createLoadingState();
  const suspender = promise.then(
    (value) => {
      state = createLoadedState(value);
    },
    (error) => {
      state = createErroredState(error);
    },
  );

  return {
    read() {
      switch (state.status) {
        case Status.Loading:
          throw suspender;
        case Status.Loaded:
          return state.value;
        case Status.Errored:
          throw state.error;
      }
    },
  };
}
