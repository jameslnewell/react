export const value = 'Hello World!';
export const error = 'Uh oh!';

export const noop = (): void => {
  /* do nothing */
};

export async function createPendingPromise(): Promise<unknown> {
  return new Promise(() => {
    /* do nothing */
  });
}

export async function createFulfilledPromise(): Promise<string> {
  return new Promise((resolve) => resolve(value));
}

export async function createRejectedPromise(): Promise<unknown> {
  return new Promise((_unused_resolve, reject) => reject(error));
}

export async function createEventuallyFulfilledPromise(): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 3000));
}

export async function createEventuallyRejectedPromise(): Promise<unknown> {
  return new Promise((_unused_resolve, reject) =>
    setTimeout(() => reject(error), 3000),
  );
}
