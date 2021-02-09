import {createResource} from './createResource';
import {
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  error,
  value,
} from './__fixtures__';

describe('createResource()', () => {
  test('throws a promise when already pending', () => {
    const resource = createResource(createPendingPromise);
    resource.preload();
    expect(() => resource.read()).toThrow(expect.any(Promise));
  });

  test('throws a promise when transitioned to pending', () => {
    const resource = createResource(createPendingPromise);
    expect(() => resource.read()).toThrow(expect.any(Promise));
  });

  test('returns a value when transitioned to fulfilled', async () => {
    const resource = createResource(createFulfilledPromise);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(resource.read()).toEqual(value);
  });

  test('throws an error when transitioned to rejected', async () => {
    const resource = createResource(createRejectedPromise);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(() => resource.read()).toThrow(error);
  });

  test('returns a cached value when already fulfilled', async () => {
    const resource = createResource(createFulfilledPromise);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(resource.read()).toEqual(value);
    expect(resource.read()).toEqual(value);
  });

  test('throws a cached error when already rejected', async () => {
    const resource = createResource(createRejectedPromise);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(() => resource.read()).toThrow(error);
    expect(() => resource.read()).toThrow(error);
  });

  test('different parameters are cached separately', async () => {
    const id1 = 'abc';
    const id2 = 'xyz';
    const resource = createResource((id: string) => Promise.resolve(id));
    try {
      resource.read(id1);
    } catch (error1) {
      await error1;
    }
    try {
      resource.read(id2);
    } catch (error2) {
      await error2;
    }
    expect(resource.read(id1)).toEqual(id1);
    expect(resource.read(id2)).toEqual(id2);
  });
});
