export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface Factory<Parameters extends unknown[], Value> {
  (...params: Parameters): Promise<Value>;
}

export interface UnknownState {
  status: undefined;
  value: undefined;
  error: undefined;
}

export interface PendingState {
  status: Status.Pending;
  value: undefined;
  error: undefined;
}

export interface FulfilledState<Value> {
  status: Status.Fulfilled;
  value: Value;
  error: undefined;
}

export interface RejectedState<Error> {
  status: Status.Rejected;
  value: undefined;
  error: Error;
}

export type State<Value, Error> =
  | UnknownState
  | PendingState
  | FulfilledState<Value>
  | RejectedState<Error>;

export interface ResourceSubscriber<Value, Error> {
  (state: State<Value, Error>): void;
}

const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
};

const pendingState: PendingState = {
  status: Status.Pending,
  value: undefined,
  error: undefined,
};

export class Resource<Parameters extends unknown[], Value, Error> {
  private _factory: Factory<Parameters, Value> | undefined = undefined;
  private _state: State<Value, Error> = unknownState;
  private _invokedPromise: Promise<Value> | undefined = undefined;
  private _waitPromise: Promise<void> | undefined = undefined;
  private _waitResolve: (() => void) | undefined = undefined;
  private _subscribers: ResourceSubscriber<Value, Error>[] = [];

  // check the promise we're handling is still the most recently executed promise
  private isPromiseCurrent(promise: Promise<Value>): boolean {
    return promise === this._invokedPromise;
  }

  private notify(): void {
    for (const subscriber of this._subscribers) {
      subscriber(this.state);
    }
  }

  /**
   * Resolves the .wait() promise
   */
  private finishWaiting(): void {
    this._waitResolve?.();
    this._waitResolve = undefined;
    this._waitPromise = undefined;
  }

  private handlePending(): void {
    this._state = pendingState;
    this.notify();
  }

  private handleFulfilled(value: Value): void {
    this._state = {
      status: Status.Fulfilled,
      value,
      error: undefined,
    };
    this._invokedPromise = undefined;
    this.notify();
    this.finishWaiting();
  }

  private handleRejected(error: Error): void {
    this._state = {
      status: Status.Rejected,
      value: undefined,
      error,
    };
    this._invokedPromise = undefined;
    this.notify();
    this.finishWaiting();
  }

  public constructor(factory: Factory<Parameters, Value> | undefined) {
    this._factory = factory;
  }

  public get state(): State<Value, Error> {
    return this._state;
  }

  public wait(): Promise<void> {
    if (this._waitPromise) {
      return this._waitPromise;
    }
    return (this._waitPromise = new Promise<void>((resolve) => {
      this._waitResolve = resolve;
    }));
  }

  public read(...params: Parameters): Value {
    if (this._state.status === Status.Rejected) {
      throw this._state.error;
    }

    if (this._state.status === Status.Fulfilled) {
      return this._state.value;
    }

    if (this._state.status === undefined) {
      this.invoke(...params);
    }

    throw this.wait();
  }

  public async invoke(...params: Parameters): Promise<Value> {
    if (!this._factory) {
      throw new Error('A factory is required to invoke an observable.');
    }

    this.handlePending();

    const promise = (this._invokedPromise = this._factory(...params).then(
      (value) => {
        if (this.isPromiseCurrent(promise)) {
          this.handleFulfilled(value);
        }
        return value;
      },
      (error) => {
        if (this.isPromiseCurrent(promise)) {
          this.handleRejected(error);
        }
        throw error;
      },
    ));
    return promise;
  }

  public subscribe = (
    subscriber: ResourceSubscriber<Value, Error>,
  ): (() => void) => {
    // subscribe
    this._subscribers.push(subscriber);

    // initialise the subscriber
    subscriber(this.state);

    // unsubscribe
    return () => {
      const index = this._subscribers.indexOf(subscriber);
      if (index !== -1) {
        this._subscribers.splice(index, 1);
      }
    };
  };
}
