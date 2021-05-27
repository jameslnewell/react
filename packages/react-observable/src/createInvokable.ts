import {Status, Factory, State} from './types';
import {Observable, Subscription} from '@jameslnewell/observable';

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
  const subscribers: Set<SubscriberFunction<Value>> = new Set();

  let resolver: (() => void) | undefined = undefined;
  let suspender: Promise<void> | undefined = undefined;
  let subscription: Subscription | undefined = undefined;

  let state: State<Value> = {
    status: undefined,
    value: undefined,
    error: undefined,
    isWaiting: false,
    isReceived: false,
    isCompleted: false,
    isErrored: false,
  };

  const notifySubscribers = (): void => {
    for (const subscriber of subscribers) {
      subscriber(state);
    }
  };

  return {
    get state() {
      return state;
    },

    get suspender() {
      if (!suspender) {
        suspender = new Promise<void>((r) => (resolver = r));
      }
      return suspender;
    },

    invoke(factory, parameters) {
      subscription?.unsubscribe();

      // create the observable
      const observable = factory(...parameters);

      state = {
        status: Status.Waiting,
        value: undefined,
        error: undefined,
        isWaiting: true,
        isReceived: false,
        isCompleted: false,
        isErrored: false,
      };
      notifySubscribers();

      subscription = observable.subscribe({
        next: (value) => {
          state = {
            status: Status.Received,
            value,
            error: undefined,
            isWaiting: false,
            isReceived: true,
            isCompleted: false,
            isErrored: false,
          };
          notifySubscribers();
          resolver?.();
          resolver = undefined;
          suspender = undefined;
        },
        complete: () => {
          if (state.status === Status.Received) {
            state = {
              status: Status.Completed,
              value: state.value,
              error: undefined,
              isWaiting: false,
              isReceived: false,
              isCompleted: true,
              isErrored: false,
            };
          } else {
            state = {
              status: Status.Errored,
              value: undefined,
              error: 'Observable completed without a value.',
              isWaiting: false,
              isReceived: false,
              isCompleted: false,
              isErrored: true,
            };
          }
          subscription = undefined;
          notifySubscribers();
          resolver?.();
          resolver = undefined;
          suspender = undefined;
        },
        error: (error) => {
          state = {
            status: Status.Errored,
            value: undefined,
            error,
            isWaiting: false,
            isReceived: false,
            isCompleted: false,
            isErrored: true,
          };
          subscription = undefined;
          notifySubscribers();
          resolver?.();
          resolver = undefined;
          suspender = undefined;
        },
      });

      return observable;
    },

    subscribe(subscriber) {
      // subscribe
      subscribers.add(subscriber);

      // Question: should we handle the case where

      // unsubscribe
      return () => {
        subscribers.delete(subscriber);
        setTimeout(() => {
          if (subscribers.size === 0) {
            subscription?.unsubscribe();
          }
        }, 0);
      };
    },
  };
}
