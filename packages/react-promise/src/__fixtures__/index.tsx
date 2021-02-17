import {
  UnknownState,
  PendingState,
  FulfilledState,
  RejectedState,
  Status,
  Factory,
} from '../types';

export const value = 'Hello World!';
export const error = 'Uh oh!';

export const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
  isPending: false,
  isFulfilled: false,
  isRejected: false,
};

export const pendingState: PendingState = {
  status: Status.Pending,
  value: undefined,
  error: undefined,
  isPending: true,
  isFulfilled: false,
  isRejected: false,
};

export const fulfilledState: FulfilledState<typeof value> = {
  status: Status.Fulfilled,
  value,
  error: undefined,
  isPending: false,
  isFulfilled: true,
  isRejected: false,
};

export const rejectedState: RejectedState = {
  status: Status.Rejected,
  value: undefined,
  error,
  isPending: false,
  isFulfilled: false,
  isRejected: true,
};

export const noop = (): void => {
  /* do nothing */
};

export function createDelay(
  factory: Factory<unknown[], unknown>,
  ms: number,
): Factory<unknown[], unknown> {
  return () =>
    new Promise((resolve, reject) => {
      setTimeout(() => factory().then(resolve, reject), ms);
    });
}

export async function createPendingPromise(): Promise<unknown> {
  return new Promise(() => {
    /* do nothing */
  });
}

export async function createFulfilledPromise(): Promise<unknown> {
  return new Promise((resolve) => resolve(value));
}

export async function createRejectedPromise(): Promise<unknown> {
  return new Promise((_unused_resolve, reject) => reject(error));
}

export async function createEventuallyFulfilledPromise(): Promise<unknown> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 3000));
}

export async function createEventuallyRejectedPromise(): Promise<unknown> {
  return new Promise((_unused_resolve, reject) =>
    setTimeout(() => reject(error), 3000),
  );
}
