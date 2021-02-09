import {Factory, Status} from '../types';
import {Store, StoreKey} from '../Store';
import {invoke} from './invoke';
import {firstValueFrom} from '@jameslnewell/observable';

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
    if (entry.status === Status.Waiting) {
      throw firstValueFrom(entry.suspender).then(
        () => {
          /* do nothing */
        },
        () => {
          /* do nothing */
        },
      );
    }
    if (entry.status === Status.Completed) {
      return entry.value;
    }
    if (entry.status === Status.Errored) {
      throw entry.error;
    }
  }
  throw firstValueFrom(invoke(options)).then(
    () => {
      /* do nothing */
    },
    () => {
      /* do nothing */
    },
  );
}
