import {Factory, Status} from './types';
import {createInvokableByParametersMap} from './createInvokable';

export interface Resource<Parameters extends unknown[], Value> {
  preload(...parameters: Parameters): void;
  read(...parameters: Parameters): Value;
}

const noop = (): void => {
  /* do nothing */
};

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
        if (state.status === Status.Pending) {
          throw invokable.getSuspender();
        }
        if (state.status === Status.Fulfilled) {
          return state.value;
        }
        if (state.status === Status.Rejected) {
          throw state.error;
        }
      }
      throw invokable.invoke().catch(noop);
    },
  };
}
