import {Factory, Status} from '../types';
import {Store, StoreKey} from '../Store';

interface InvokeOptions<Parameters extends unknown[], Value> {
  store: Store;
  key: StoreKey;
  factory: Factory<Parameters, Value>;
  parameters: Parameters;
}

export function invoke<Parameters extends unknown[], Value>({
  store,
  key,
  factory,
  parameters,
}: InvokeOptions<Parameters, Value>): Promise<Value> {
  const promise: Promise<Value> = factory(...parameters).then(
    (value) => {
      store.setState(key, (previousState) => {
        if (suspender === previousState.suspender) {
          return {
            status: Status.Fulfilled,
            value,
            error: undefined,
            suspender,
          };
        } else {
          return previousState;
        }
      });
      return value;
    },
    (error) => {
      store.setState(key, (previousState) => {
        if (suspender === previousState.suspender) {
          return {
            status: Status.Rejected,
            value: undefined,
            error,
            suspender,
          };
        } else {
          return previousState;
        }
      });
      throw error;
    },
  );
  const suspender = promise.then(
    () => {
      /* do nothing */
    },
    () => {
      /* do nothing */
    },
  );
  store.setState(key, {
    status: Status.Pending,
    value: undefined,
    error: undefined,
    suspender,
  });
  return promise;
}
