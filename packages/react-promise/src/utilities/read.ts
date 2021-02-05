import {Factory, Status} from '../types';
import {Store, StoreKey} from '../Store';
import {invoke} from './invoke';

interface ReadOptions<Parameters extends unknown[], Value> {
  store: Store;
  key: StoreKey;
  factory: Factory<Parameters, Value>;
  parameters: Parameters;
}

export function read<Parameters extends unknown[], Value>(
  options: ReadOptions<Parameters, Value>,
): Value {
  const entry = options.store.getState<Value>(options.key);
  if (entry) {
    if (entry.status === Status.Pending) {
      throw entry.suspender;
    }
    if (entry.status === Status.Fulfilled) {
      return entry.value;
    }
    if (entry.status === Status.Rejected) {
      throw entry.error;
    }
  }
  throw invoke(options);
}
