import {Factory, Status} from './types';
import {createInvokableByParametersMap} from './createInvokable';

export interface Resource<Parameters extends unknown[], Value> {
  preload(...parameters: Parameters): void;
  read(...parameters: Parameters): Value;
}

export function createResource<Parameters extends unknown[], Value>(
  factory: Factory<Parameters, Value>,
): Resource<Parameters, Value> {
  const invokablesByParametersMap = createInvokableByParametersMap(factory);
  return {
    preload: (...parameters) => {
      const invokable = invokablesByParametersMap.get(parameters);
      const state = invokable.getState();
      if (state?.status) {
        return;
      }
      invokable.invoke();
    },
    read: (...parameters) => {
      const invokable = invokablesByParametersMap.get(parameters);
      const state = invokable.getState();
      if (state) {
        if (state.status === Status.Waiting) {
          throw invokable.getSuspender();
        }
        if (
          state.status === Status.Received ||
          state.status === Status.Completed
        ) {
          return state.value;
        }
        if (state.status === Status.Errored) {
          throw state.error;
        }
      }
      throw invokable.invoke();
    },
  };
}
