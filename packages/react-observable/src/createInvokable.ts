import {Status, Factory, State} from './types';
import {noop} from './noop';
import {
  firstValueFrom,
  Observable,
  Subscription,
} from '@jameslnewell/observable';

export interface SubscriberFunction<Value> {
  (state: State<Value>): void;
}

export interface UnsubscribeFunction {
  (): void;
}

export interface Invokable<Parameters extends unknown[], Value> {
  readonly state: State<Value>;
  readonly suspender: Promise<void> | undefined;
  invoke(
    factory: Factory<Parameters, Value>,
    parameters: Parameters,
  ): Observable<Value>;
  subscribe(subscriber: SubscriberFunction<Value>): UnsubscribeFunction;
}

export function createInvokable<
  Parameters extends unknown[],
  Value
>(): Invokable<Parameters, Value> {
  let subscription: Subscription | undefined = undefined;
  const subscribers: Set<SubscriberFunction<Value>> = new Set();

  let currentState: State<Value> = {
    status: undefined,
    value: undefined,
    error: undefined,
    isWaiting: false,
    isReceived: false,
    isCompleted: false,
    isErrored: false,
  };

  let currentSuspender: Promise<void> | undefined = undefined;

  const notifySubscribers = (): void => {
    for (const subscriber of subscribers) {
      subscriber(currentState);
    }
  };

  return {
    get state() {
      return currentState;
    },

    get suspender() {
      // TODO: promise that resolves when the last invoke resolves
      return currentSuspender;
    },

    invoke(factory, parameters) {
      // create the observable
      const observable = factory(...parameters);

      currentState = {
        status: Status.Waiting,
        value: undefined,
        error: undefined,
        isWaiting: true,
        isReceived: false,
        isCompleted: false,
        isErrored: false,
      };
      const nextSuspender = firstValueFrom(observable).then(noop, noop);
      currentSuspender = nextSuspender;
      notifySubscribers();

      subscription = observable.subscribe({
        next: (value) => {
          if (nextSuspender === currentSuspender) {
            currentState = {
              status: Status.Received,
              value,
              error: undefined,
              isWaiting: false,
              isReceived: true,
              isCompleted: false,
              isErrored: false,
            };
            notifySubscribers();
          }
        },
        complete: () => {
          if (nextSuspender === currentSuspender) {
            if (currentState.status === Status.Received) {
              currentState = {
                status: Status.Completed,
                value: currentState.value,
                error: undefined,
                isWaiting: false,
                isReceived: false,
                isCompleted: true,
                isErrored: false,
              };
            } else {
              currentState = {
                status: Status.Errored,
                value: undefined,
                error: 'Observable completed without a value.',
                isWaiting: false,
                isReceived: false,
                isCompleted: false,
                isErrored: true,
              };
            }
            currentSuspender = undefined;
            notifySubscribers();
          }
        },
        error: (error) => {
          if (nextSuspender === currentSuspender) {
            currentState = {
              status: Status.Errored,
              value: undefined,
              error,
              isWaiting: false,
              isReceived: false,
              isCompleted: false,
              isErrored: true,
            };
            currentSuspender = undefined;
            notifySubscribers();
          }
        },
      });

      return observable;
    },

    subscribe(subscriber) {
      // subscribe
      subscribers.add(subscriber);

      // initialise the subscriber
      subscriber(currentState);

      // unsubscribe
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0) {
          subscription?.unsubscribe();
        }
      };
    },
  };
}
