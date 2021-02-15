import {Status, Factory, State} from './types';

const noop = (): void => {
  /* do nothing */
};

export interface SubscriberFunction<Value> {
  (state: State<Value>): void;
}

export interface UnsubscribeFunction {
  (): void;
}

export interface Invokable<Value> {
  invoke(): Promise<Value>;
  getState(): State<Value>;
  getSuspender(): Promise<void> | undefined;
  subscribe(subscriber: SubscriberFunction<Value>): UnsubscribeFunction;
}

export function createInvokable<Parameters extends unknown[], Value>(
  invoke: Factory<Parameters, Value>,
  parameters: Parameters,
): Invokable<Value> {
  const subscribers: Set<SubscriberFunction<Value>> = new Set();

  let state: State<Value> = {
    status: undefined,
    value: undefined,
    error: undefined,
    isPending: false,
    isFulfilled: false,
    isRejected: false,
  };

  let suspender: Promise<void> | undefined = undefined;

  const notifySubscribers = (): void => {
    for (const subscriber of subscribers) {
      subscriber(state);
    }
  };

  return {
    getState() {
      return state;
    },

    getSuspender() {
      return suspender;
    },

    invoke() {
      const promise: Promise<Value> = invoke(...parameters).then(
        (value) => {
          if (nextSuspender === suspender) {
            state = {
              status: Status.Fulfilled,
              value,
              error: undefined,
              isPending: false,
              isFulfilled: true,
              isRejected: false,
            };
            suspender = undefined;
            notifySubscribers();
          }
          return value;
        },
        (error) => {
          if (nextSuspender === suspender) {
            state = {
              status: Status.Rejected,
              value: undefined,
              error,
              isPending: false,
              isFulfilled: false,
              isRejected: true,
            };
            suspender = undefined;
            notifySubscribers();
          }
          throw error;
        },
      );

      state = {
        status: Status.Pending,
        value: undefined,
        error: undefined,
        isPending: true,
        isFulfilled: false,
        isRejected: false,
      };
      const nextSuspender = promise.then(noop, noop);
      suspender = nextSuspender;
      notifySubscribers();

      return promise;
    },

    subscribe(subscriber) {
      // subscribe
      subscribers.add(subscriber);

      // initialise the subscriber
      subscriber(state);

      // unsubscribe
      return () => {
        subscribers.delete(subscriber);
      };
    },
  };
}
