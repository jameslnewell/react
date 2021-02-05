import {Factory} from '../types';
import {Store, StoreKey} from '../Store';
import {invoke} from './invoke';

interface PreloadOptions<Parameters extends unknown[], Value> {
  store: Store;
  key: StoreKey;
  factory: Factory<Parameters, Value>;
  parameters: Parameters;
}

export function preload<Parameters extends unknown[], Value>(
  options: PreloadOptions<Parameters, Value>,
): void {
  const entry = options.store.getState(options.key);
  if (entry.status) {
    return;
  }
  invoke(options);
}
