import {Factory} from './types';
import {Store} from './Store';
import {preload} from './utilities/preload';
import {read} from './utilities/read';

export interface Resource<Parameters extends unknown[], Value> {
  preload(...parameters: Parameters): void;
  read(...parameters: Parameters): Value;
}

export function createResource<Parameters extends unknown[], Value>(
  factory: Factory<Parameters, Value>,
): Resource<Parameters, Value> {
  const store = new Store();
  return {
    preload: (...parameters) =>
      preload<Parameters, Value>({
        store,
        key: [factory, ...parameters],
        factory,
        parameters,
      }),
    read: (...parameters) =>
      read<Parameters, Value>({
        store,
        key: [factory, ...parameters],
        factory,
        parameters,
      }),
  };
}
