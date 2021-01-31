export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface Factory<Parameters extends unknown[], Value> {
  (...params: Parameters): Promise<Value>;
}

interface UninitialisedState {
  status: undefined;
  value: undefined;
  error: undefined;
}

interface PendingState {
  status: Status.Pending;
  value: undefined;
  error: undefined;
}

interface FulfilledState<Value> {
  status: Status.Fulfilled;
  value: Value;
  error: undefined;
}

interface RejectedState<Error> {
  status: Status.Rejected;
  value: undefined;
  error: Error;
}

export type State<Value, Error> =
  | UninitialisedState
  | PendingState
  | FulfilledState<Value>
  | RejectedState<Error>;

export interface ResourceSubscriber<Value, Error> {
  (state: State<Value, Error>): void;
}

const initialState: UninitialisedState = {
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
  private state: State<Value, Error> = initialState;
  private invokedPromise: Promise<Value> | undefined = undefined;
  private waitPromise: Promise<void> | undefined = undefined;
  private waitResolve: (() => void) | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private waitReject: ((reason?: any) => void) | undefined = undefined;
  private subscribers: ResourceSubscriber<Value, Error>[] = [];

  private notify(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.getState());
    }
  }

  public getState = (): State<Value, Error> => {
    return this.state;
  };

  public wait = (): Promise<void> => {
    if (this.waitPromise) {
      return this.waitPromise;
    }
    if (this.state.status !== Status.Pending) {
      return Promise.resolve();
    }
    return (this.waitPromise = new Promise<void>((resolve, reject) => {
      this.waitResolve = resolve;
      this.waitReject = reject;
    }));
  };

  public invoke = async (
    factory: Factory<Parameters, Value>,
    params: Parameters,
  ): Promise<Value> => {
    // update the state and notify subscribers
    this.state = pendingState;
    this.notify();
    const promise = (this.invokedPromise = factory(...params).then(
      (value) => {
        // check the promise we're handling is still the most recently executed promise
        if (promise === this.invokedPromise) {
          // update the state and notify subscribers
          this.state = {
            status: Status.Fulfilled,
            value,
            error: undefined,
          };
          this.notify();
          this.waitResolve?.();
          this.invokedPromise = undefined;
          this.waitPromise = undefined;
          this.waitResolve = undefined;
          this.waitReject = undefined;
        }
        return value;
      },
      (error) => {
        // check the promise we're handling is still the most recently executed promise
        if (promise === this.invokedPromise) {
          // update the state and notify subscribers
          this.state = {
            status: Status.Rejected,
            value: undefined,
            error,
          };
          this.notify();
          this.waitReject?.(error);
          this.invokedPromise = undefined;
          this.waitPromise = undefined;
          this.waitResolve = undefined;
          this.waitReject = undefined;
        }
        throw error;
      },
    ));
    return promise;
  };

  public reset = (): void => {
    this.state = initialState;
    this.waitResolve?.();
    this.invokedPromise = undefined;
    this.waitPromise = undefined;
    this.notify();
  };

  public subscribe = (
    subscriber: ResourceSubscriber<Value, Error>,
  ): (() => void) => {
    // subscribe
    this.subscribers.push(subscriber);

    // initialise the subscriber
    subscriber(this.getState());

    // unsubscribe
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  };
}
