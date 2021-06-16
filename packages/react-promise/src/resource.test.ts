import {createResource} from './resource';
import {
  value,
  error,
  createPendingPromise,
  createFulfilledPromise,
  createRejectedPromise,
} from './__fixtures__';

describe('createResource()', () => {
  test('read() should throw a promise when the promise is yet to resolve a value', () => {
    expect.assertions(1);
    const resource = createResource(createPendingPromise());
    try {
      resource.read();
    } catch (e) {
      expect(e).toBeInstanceOf(Promise);
    }
  });

  test('read() should return value when the promise has fulfilled', async () => {
    expect.assertions(1);
    const resource = createResource(createFulfilledPromise());
    try {
      resource.read();
    } catch (e) {
      await e;
    }
    expect(resource.read()).toEqual(value);
  });

  test('read() should throw an error when the promise has rejected', async () => {
    expect.assertions(1);
    const resource = createResource(createRejectedPromise());
    try {
      resource.read();
    } catch (e) {
      await e;
    }
    try {
      resource.read();
    } catch (e) {
      expect(e).toEqual(error);
    }
  });
});
