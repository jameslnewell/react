import {Invokable} from './invokable';

function createHash(keys: unknown[]): string {
  const key = JSON.stringify(
    keys.map((key) => {
      if (typeof key === 'function') {
        return `[function ${key}]`;
      }
      return key;
    }),
  );
  return key;
}

// used by createResource()
export class InvokableCache {
  private invokers: Map<string, Invokable<unknown>> = new Map();

  public get<Value = unknown>(keys: unknown[]): Invokable<Value> | undefined {
    const hash = createHash(keys);
    return this.invokers.get(hash) as Invokable<Value> | undefined;
  }

  public set<Value = unknown>(
    keys: unknown[],
    invoker: Invokable<Value>,
  ): void {
    const hash = createHash(keys);
    this.invokers.set(hash, invoker);
  }

  public remove(keys: unknown[]): void {
    const hash = createHash(keys);
    this.invokers.delete(hash);
  }
}

// used by usePromise and useObservable hooks which maintain a life cycle
export class ReferenceCountedInvokableCache extends InvokableCache {
  // called on mount when a component is tracking
  reference(key: unknown[]) {
    // increment count
  }

  // called on unmount when a component is tracking
  dereference(key: unknown[]) {
    // decrement count
    // when count is 0 then remove from cache
  }
}
