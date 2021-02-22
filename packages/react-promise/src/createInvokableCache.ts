import {Invokable} from './createInvokable';

export interface InvokableCache {
  clear(): void;

  get<Parameters extends unknown[], Value = unknown>(
    hash: string,
  ): Invokable<Parameters, Value> | undefined;

  set<Value = unknown>(
    hash: string,
    invokable: Invokable<unknown[], Value>,
  ): void;

  remove(hash: string): void;

  reference(hash: string): void;
  dereference(hash: string): void;
}

export function createInvokableCache(): InvokableCache {
  const counts: Map<string, number> = new Map();
  const invokables: Map<string, Invokable<unknown[], unknown>> = new Map();

  return {
    clear() {
      invokables.clear();
      counts.clear();
    },

    get<Parameters extends unknown[], Value = unknown>(
      hash: string,
    ): Invokable<Parameters, Value> | undefined {
      return invokables.get(hash) as Invokable<Parameters, Value> | undefined;
    },

    set<Value = unknown>(
      hash: string,
      invoker: Invokable<unknown[], Value>,
    ): void {
      invokables.set(hash, invoker);
    },

    remove(hash: string): void {
      invokables.delete(hash);
      counts.delete(hash);
    },

    // called on mount when a component is tracking
    reference(hash: string): void {
      const count = counts.get(hash);
      const nextCount = count ? count + 1 : 1;
      counts.set(hash, nextCount);
    },

    // called on unmount when a component is tracking
    dereference(hash: string): void {
      const count = counts.get(hash);
      const nextCount = count ? count - 1 : 0;
      counts.set(hash, nextCount);

      // React calls render() on the next component before unmount() on the
      // previous component so when the next and previous components use the same
      // key the next component reuses the previous invokable which is removed
      // from the cache after render when the unmount effect runs, resulting in
      // the invokable being recreated etc
      setTimeout(() => {
        // when count is 0 then remove from cache
        if (counts.get(hash) === 0) {
          this.remove(hash);
        }
      }, 0);
    },
  };
}
