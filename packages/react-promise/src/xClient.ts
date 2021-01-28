import {Status, Factory} from './types';

interface PendingState {
  status: Status.Pending;
  value: undefined;
  error: undefined;
}

interface FulfilledState<Value = unknown> {
  status: Status.Fulfilled;
  value: Value;
  error: undefined;
}

interface RejectedState<Error = unknown> {
  status: Status.Rejected;
  value: undefined;
  error: Error;
}

type State<Value = unknown, Error = unknown> =
  | PendingState
  | FulfilledState<Value>
  | RejectedState<Error>;

export class Client {
  private states: Map<string, State> = new Map();
  private promises: Map<string, Promise<unknown>> = new Map();

  private getKey<Value = unknown, Parameters extends unknown[] = []>(
    fn: Factory<Parameters, Value>,
    params: Parameters,
  ): string {
    // IMPORTANT: params should be compared with shallow equality
    return JSON.stringify([fn.name, params]);
  }

  public invoke<Value = unknown, Parameters extends unknown[] = []>(
    fn: Factory<Parameters, Value>,
    params: Parameters,
    {force}: {force?: boolean} = {},
  ): Promise<Value> {
    const key = this.getKey(fn, params);

    // use the already invoked promise
    if (!force) {
      const state = this.states.get(key);
      const promise = this.promises.get(key);
      if (state && promise) {
        return promise as Promise<Value>;
      }
    }

    this.states.set(key, {
      status: Status.Pending,
      value: undefined,
      error: undefined,
    });

    const promise = fn(...params).then(
      (value) => {
        this.states.set(key, {
          status: Status.Fulfilled,
          value,
          error: undefined,
        });
        return value;
      },
      (error) => {
        this.states.set(key, {
          status: Status.Rejected,
          value: undefined,
          error,
        });
        throw error;
      },
    );

    this.promises.set(key, promise);

    return promise;
  }

  public clear<Value = unknown, Parameters extends unknown[] = []>(
    fn: Factory<Parameters, Value>,
    params: Parameters,
  ): void {
    const key = this.getKey(fn, params);
    this.states.delete(key);
    this.promises.delete(key);
  }

  public suspendWhenPending<Value = unknown, Parameters extends unknown[] = []>(
    fn: Factory<Parameters, Value>,
    params: Parameters,
  ): void {
    const key = this.getKey(fn, params);
    const state = this.states.get(key);
    const promise = this.promises.get(key);

    if (!state || !promise) {
      return;
    }

    if (state.status === Status.Pending) {
      throw promise;
    }
  }

  public throwWhenRejected<Value = unknown, Parameters extends unknown[] = []>(
    fn: Factory<Parameters, Value>,
    params: Parameters,
  ): void {
    const key = this.getKey(fn, params);
    const state = this.states.get(key);
    const promise = this.promises.get(key);

    if (!state || !promise) {
      return;
    }

    if (state.status === Status.Rejected) {
      throw state.error;
    }
  }
}

export const client = new Client();
