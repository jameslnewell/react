import {
  Factory,
  Status,
  PendingState,
  FulfilledState,
  RejectedState,
} from './types';

export type InvokableState<Value> =
  | PendingState
  | FulfilledState<Value>
  | RejectedState;

export interface InvokableSubscriber<Value> {
  (state: InvokableState<Value> | undefined): void;
}

export interface InvokableUbsubscribe {
  (): void;
}

export interface Invokable<Value> {
  getState(): InvokableState<Value> | undefined;
  getSuspender(): Promise<void> | undefined;
  reset(): void;
  invoke(): Promise<Value>;
  subscribe(subscriber: InvokableSubscriber<Value>): () => void;
}

function noop(): void {
  // do nothing
}

export function createInvokable<Parameters extends unknown[], Value>(
  factory: Factory<Parameters, Value>,
  parameters: Parameters,
): Invokable<Value> {
  let state: InvokableState<Value> | undefined = undefined;
  let suspender: Promise<void> | undefined = undefined;
  const subscribers: Set<InvokableSubscriber<Value>> = new Set();

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

    reset() {
      state = undefined;
      suspender = undefined;
      notifySubscribers();
    },

    invoke() {
      const promise: Promise<Value> = factory(...parameters).then(
        (value) => {
          if (nextSuspender === suspender) {
            state = {
              status: Status.Fulfilled,
              value,
              error: undefined,
            };
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
            };
            notifySubscribers();
          }
          throw error;
        },
      );

      if (state?.status !== Status.Pending) {
        state = {
          status: Status.Pending,
          value: undefined,
          error: undefined,
        };
        notifySubscribers();
      }

      const nextSuspender = promise.then(noop, noop);

      suspender = nextSuspender;

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

export interface InvokableByParamtersMap<Parameters extends unknown[], Value> {
  get(parameters: Parameters): Invokable<Value>;
  delete(parameters: Parameters): void;
}

export function createInvokableByParametersMap<
  Parameters extends unknown[],
  Value
>(
  factory: Factory<Parameters, Value>,
): InvokableByParamtersMap<Parameters, Value> {
  const invokables: Map<string, Invokable<Value>> = new Map();
  return {
    get(parameters) {
      const key = createKey(parameters);
      let invokable = invokables.get(key);
      if (!invokable) {
        invokable = createInvokable(factory, parameters);
        invokables.set(key, invokable);
      }
      return invokable;
    },

    delete(parameters) {
      const key = createKey(parameters);
      invokables.delete(key);
    },
  };
}

export interface InvokableByFactoryByParamtersMap {
  get<Parameters extends unknown[], Value>(
    factory: Factory<Parameters, Value>,
  ): InvokableByParamtersMap<Parameters, Value>;
  delete<Parameters extends unknown[], Value>(
    factory: Factory<Parameters, Value>,
  ): void;
}

export function createInvokableByFactoryByParamtersMap(): InvokableByFactoryByParamtersMap {
  const invokablesByFactoryByParameters: Map<
    Factory<unknown[], unknown>,
    InvokableByParamtersMap<unknown[], unknown>
  > = new Map();
  return {
    get<Parameters extends unknown[], Value>(
      factory: Factory<Parameters, Value>,
    ): InvokableByParamtersMap<Parameters, Value> {
      let invokablesByParameters = invokablesByFactoryByParameters.get(
        factory as Factory<unknown[], unknown>,
      );
      if (!invokablesByParameters) {
        invokablesByParameters = createInvokableByParametersMap(factory);
        invokablesByFactoryByParameters.set(
          factory as Factory<unknown[], unknown>,
          invokablesByParameters,
        );
      }
      return invokablesByParameters as InvokableByParamtersMap<
        Parameters,
        Value
      >;
    },

    delete(factory) {
      invokablesByFactoryByParameters.delete(
        factory as Factory<unknown[], unknown>,
      );
    },
  };
}

function createKey(parameters: unknown[]): string {
  const key = JSON.stringify(
    parameters.map((parameter) => {
      if (typeof parameter === 'function') {
        return `[function ${parameter}]`;
      }
      return parameter;
    }),
  );
  return key;
}
