import {Status, Factory, State} from './types';
import {noop} from './noop';

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
  ): Promise<Value>;
  subscribe(subscriber: SubscriberFunction<Value>): UnsubscribeFunction;
}

export function createInvokable<
  Parameters extends unknown[],
  Value
>(): Invokable<Parameters, Value> {
  const subscribers: Set<SubscriberFunction<Value>> = new Set();

  let currentState: State<Value> = {
    status: undefined,
    value: undefined,
    error: undefined,
    isPending: false,
    isFulfilled: false,
    isRejected: false,
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
      // TODO: promise that resolves when the last called invoke resolves
      return currentSuspender;
    },

    invoke(factory, parameters) {
      const promise: Promise<Value> = factory(...parameters).then(
        (value) => {
          if (nextSuspender === currentSuspender) {
            currentState = {
              status: Status.Fulfilled,
              value,
              error: undefined,
              isPending: false,
              isFulfilled: true,
              isRejected: false,
            };
            currentSuspender = undefined;
            notifySubscribers();
          }
          return value;
        },
        (error) => {
          if (nextSuspender === currentSuspender) {
            currentState = {
              status: Status.Rejected,
              value: undefined,
              error,
              isPending: false,
              isFulfilled: false,
              isRejected: true,
            };
            currentSuspender = undefined;
            notifySubscribers();
          }
          throw error;
        },
      );

      currentState = {
        status: Status.Pending,
        value: undefined,
        error: undefined,
        isPending: true,
        isFulfilled: false,
        isRejected: false,
      };
      const nextSuspender = promise.then(noop, noop);
      currentSuspender = nextSuspender;
      notifySubscribers();

      return promise;
    },

    subscribe(subscriber) {
      // subscribe
      subscribers.add(subscriber);

      // unsubscribe
      return () => {
        subscribers.delete(subscriber);
      };
    },
  };
}
