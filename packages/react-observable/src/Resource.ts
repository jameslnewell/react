import {Observable} from '@jameslnewell/observable';

export enum Status {
  Waiting = 'waiting',
  Receieved = 'received',
  Completed = 'completed',
  Errored = 'errored',
}

export interface Factory<Parameters extends unknown[], Value, Error> {
  (...params: Parameters): Observable<Value, Error>;
}

export interface UnknownState {
  status: undefined;
  value: undefined;
  error: undefined;
}

export interface WaitingState {
  status: Status.Waiting;
  value: undefined;
  error: undefined;
}

export interface ReceivedState<Value> {
  status: Status.Receieved;
  value: Value;
  error: undefined;
}

export interface CompletedState<Value> {
  status: Status.Completed;
  value: Value;
  error: undefined;
}

export interface ErroredState<Error> {
  status: Status.Errored;
  value: undefined;
  error: Error;
}

export type State<Value, Error> =
  | UnknownState
  | WaitingState
  | ReceivedState<Value>
  | CompletedState<Value>
  | ErroredState<Error>;

export interface ResourceSubscriber<Value, Error> {
  (state: State<Value, Error>): void;
}

const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
};

const waitingState: WaitingState = {
  status: Status.Waiting,
  value: undefined,
  error: undefined,
};

export class Resource<Parameters extends unknown[], Value, Error> {
  private _factory: Factory<Parameters, Value, Error> | undefined = undefined;
  private _state: State<Value, Error> = unknownState;
  private _invokedObservable: Observable<Value> | undefined = undefined;
  private _waitPromise: Promise<void> | undefined = undefined;
  private _waitResolve: (() => void) | undefined = undefined;
  private _subscribers: ResourceSubscriber<Value, Error>[] = [];

  // check the observable we're handling is still the most recently executed promise
  private isObservableCurrent(observable: Observable<Value, Error>): boolean {
    return observable === this._invokedObservable;
  }

  /**
   * Notifies subscribers that the state has changed
   */
  private notify(): void {
    for (const subscriber of this._subscribers) {
      subscriber(this._state);
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

  private handleWaiting(): void {
    this._state = waitingState;
    this.notify();
  }

  private handleReceive(value: Value): void {
    this._state = {
      status: Status.Receieved,
      value,
      error: undefined,
    };
    this.notify();
    this.finishWaiting();
  }

  private handleComplete(): void {
    if (this._state.status === Status.Receieved) {
      // update the state and notify subscribers
      this._state = {
        status: Status.Completed,
        value: this._state.value,
        error: undefined,
      };
    } else {
      // update the state and notify subscribers
      this._state = {
        status: Status.Errored,
        value: undefined,
        error: (new Error('No value was received.') as unknown) as Error,
      };
    }
    this._invokedObservable = undefined;
    this.notify();
    this.finishWaiting();
  }

  private handleError(error: Error): void {
    this._state = {
      status: Status.Errored,
      value: undefined,
      error,
    };
    this._invokedObservable = undefined;
    this.notify();
    this.finishWaiting();
  }

  public constructor(factory: Factory<Parameters, Value, Error> | undefined) {
    this._factory = factory;
  }

  public get state(): State<Value, Error> {
    return this._state;
  }

  public wait(): Promise<void> {
    if (this._waitPromise) {
      return this._waitPromise;
    }
    return (this._waitPromise = new Promise((resolve) => {
      this._waitResolve = resolve;
    }));
  }

  public read(...params: Parameters): Value {
    if (this._state.status === Status.Errored) {
      throw this._state.error;
    }

    if (
      this._state.status === Status.Receieved ||
      this._state.status === Status.Completed
    ) {
      return this._state.value;
    }

    if (this._state.status === undefined) {
      this.invoke(...params);
    }

    throw this.wait();
  }

  public invoke(...params: Parameters): Observable<Value, Error> {
    if (!this._factory) {
      throw new Error('A factory is required to invoke an observable.');
    }

    this.handleWaiting();

    const observable = (this._invokedObservable = this._factory(...params));
    observable.subscribe({
      next: (value) => {
        if (this.isObservableCurrent(observable)) {
          this.handleReceive(value);
        }
      },
      complete: () => {
        if (this.isObservableCurrent(observable)) {
          this.handleComplete();
        }
      },
      error: (error) => {
        if (this.isObservableCurrent(observable)) {
          this.handleError(error);
        }
      },
    });
    return observable;
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
      // TODO: should we unsubscribe from the observable if there are no subscribers left?
      const index = this._subscribers.indexOf(subscriber);
      if (index !== -1) {
        this._subscribers.splice(index, 1);
      }
    };
  };
}
