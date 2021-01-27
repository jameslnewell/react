import {createResource, CreateResourceStatus} from './createResource';
import {
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  error,
  value,
} from './__fixtures__';

const nextTick = async (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

describe('createResource()', () => {
  test('returns an uninitiated resource', () => {
    const resource = createResource(createPendingPromise);
    expect(resource.status).toBeUndefined();
    expect(resource.value).toBeUndefined();
    expect(resource.error).toBeUndefined();
  });

  describe('preload()', () => {
    test('resource is pending when pending', () => {
      const resource = createResource(createPendingPromise);
      resource.preload();
      expect(resource.status).toEqual(CreateResourceStatus.Pending);
      expect(resource.value).toBeUndefined();
      expect(resource.error).toBeUndefined();
    });

    test('resource resolves when fulfilled', async () => {
      const resource = createResource(createFulfilledPromise);
      resource.preload();
      await nextTick();
      expect(resource.status).toEqual(CreateResourceStatus.Fulfilled);
      expect(resource.value).toEqual(value);
      expect(resource.error).toBeUndefined();
    });

    test('resource rejects when rejected', async () => {
      const resource = createResource(createRejectedPromise);
      resource.preload();
      await nextTick();
      expect(resource.status).toEqual(CreateResourceStatus.Rejected);
      expect(resource.value).toBeUndefined();
      expect(resource.error).toEqual(error);
    });
  });

  describe('read()', () => {
    test('resource throws when pending', () => {
      const resource = createResource(createPendingPromise);
      expect(() => resource.read()).toThrow(expect.any(Promise));
      expect(resource.status).toEqual(CreateResourceStatus.Pending);
      expect(resource.value).toBeUndefined();
      expect(resource.error).toBeUndefined();
    });

    test('resource returns when fulfilled', async () => {
      const resource = createResource(createFulfilledPromise);
      expect(() => resource.read()).toThrow(expect.any(Promise));
      await nextTick();
      expect(resource.read()).toEqual(value);
      expect(resource.status).toEqual(CreateResourceStatus.Fulfilled);
      expect(resource.value).toEqual(value);
      expect(resource.error).toBeUndefined();
    });

    test('resource throws when rejected', async () => {
      const resource = createResource(createRejectedPromise);
      expect(() => resource.read()).toThrow(expect.any(Promise));
      await nextTick();
      expect(() => resource.read()).toThrow(error);
      expect(resource.status).toEqual(CreateResourceStatus.Rejected);
      expect(resource.value).toBeUndefined();
      expect(resource.error).toEqual(error);
    });
  });
});
