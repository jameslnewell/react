import {Client} from './xClient';
import {
  value,
  error,
  createPendingPromise,
  createRejectedPromise,
  createFulfilledPromise,
} from './__fixtures__';

describe('createClient()', () => {
  test('throws promise when the fn has not been invoked before', () => {
    const client = new Client();
    expect(() => client.suspendWhenPending(createPendingPromise, [])).toThrow(
      expect.any(Promise),
    );
  });

  test('throws promise when the fn has been invoked before and the promise is pending', () => {
    const client = new Client();
    client.invoke(createPendingPromise, []);
    expect(() => client.suspendWhenPending(createPendingPromise, [])).toThrow(
      expect.any(Promise),
    );
  });

  test('throws error when the fn has been invoked before and the promise is rejected', async () => {
    const client = new Client();
    await client.invoke(createRejectedPromise, []).catch(() => {
      /* do nothing */
    });
    expect(() => client.read(createRejectedPromise, [])).toThrow(error);
  });

  test('returns value when the fn has been invoked before and the promise is fulfilled', async () => {
    const client = new Client();
    await client.invoke(createFulfilledPromise, []);
    expect(client.read(createFulfilledPromise, [])).toEqual(value);
  });

  test('multiple fns return unique results', async () => {
    const client = new Client();
    await Promise.all([
      client.invoke(createFulfilledPromise, []),
      client.invoke(createRejectedPromise, []).catch(() => {
        /* do nothing */
      }),
    ]);
    expect(client.read(createFulfilledPromise, [])).toEqual(value);
    expect(() => client.read(createRejectedPromise, [])).toThrow(error);
  });
});
