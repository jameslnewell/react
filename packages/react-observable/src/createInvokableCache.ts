import {createHash} from './createHash';
import {Invokable} from './createInvokable';

export interface InvokableCache {
  get<Parameters extends unknown[], Value = unknown>(
    keys: unknown[],
  ): Invokable<Parameters, Value> | undefined;

  set<Value = unknown>(
    keys: unknown[],
    invoker: Invokable<unknown[], Value>,
  ): void;

  remove(keys: unknown[]): void;

  reference(keys: unknown[]): void;
  dereference(keys: unknown[]): void;
}

export function createInvokableCache(): InvokableCache {
  const counts: Map<string, number> = new Map();
  const invokables: Map<string, Invokable<unknown[], unknown>> = new Map();

  return {
    get<Parameters extends unknown[], Value = unknown>(
      keys: unknown[],
    ): Invokable<Parameters, Value> | undefined {
      const hash = createHash(keys);
      return invokables.get(hash) as Invokable<Parameters, Value> | undefined;
    },

    set<Value = unknown>(
      keys: unknown[],
      invoker: Invokable<unknown[], Value>,
    ): void {
      const hash = createHash(keys);
      invokables.set(hash, invoker);
    },

    remove(keys: unknown[]): void {
      const hash = createHash(keys);
      invokables.delete(hash);
    },

    // called on mount when a component is tracking
    reference(keys: unknown[]): void {
      const hash = createHash(keys);

      // increment count
      const count = counts.get(hash);
      const nextCount = count ?? 0 + 1;
      counts.set(hash, nextCount);
    },

    // called on unmount when a component is tracking
    dereference(keys: unknown[]): void {
      const hash = createHash(keys);

      // decrement count
      const count = counts.get(hash);
      const nextCount = count ?? 1 - 1;

      // when count is 0 then remove from cache
      if (nextCount == 0) {
        this.remove(keys);
        counts.delete(hash);
      } else {
        counts.set(hash, nextCount);
      }
    },
  };
}
