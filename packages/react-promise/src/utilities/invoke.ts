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
  const suspender: Promise<Value> = factory(...parameters).then(
    (value) => {
      // TODO: make more efficient to avoid arrary searching e.g. maybe fn inside setState returns prev state
      if (suspender === store.getState(key)?.suspender) {
        store.setState(key, {
          status: Status.Fulfilled,
          value,
          error: undefined,
          suspender,
        });
      }
      return value;
    },
    (error) => {
      // TODO: make more efficient to avoid arrary searching e.g. maybe fn inside setState returns prev state
      if (suspender === store.getState(key)?.suspender) {
        store.setState(key, {
          status: Status.Rejected,
          value: undefined,
          error,
          suspender,
        });
      }
      throw error;
    },
  );
  console.log('pending');
  store.setState(key, {
    status: Status.Pending,
    value: undefined,
    error: undefined,
    suspender,
  });
  return suspender;
}
