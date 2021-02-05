import {waitForExpect} from 'testing-utilities';
import {
  Store,
  StoreState,
  StoreKey,
  invoke,
  read,
  createResource,
} from './Store';
import {Status} from './types';
import {
  value,
  error,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  unknownState,
} from './__fixtures__';

const fulfilledFactory = (..._unused_parameters: unknown[]): Promise<unknown> =>
  Promise.resolve(value);
const rejectedFactory = (..._unused_parameters: unknown[]): Promise<unknown> =>
  Promise.reject(error);
const parameters1 = [{}, 'hi', 1];
const parameters2 = [{}, 'hi', 2];

const key: StoreKey = {
  factory: fulfilledFactory,
  parameters: parameters1,
};

const fulfilledKey: StoreKey = {
  factory: fulfilledFactory,
  parameters: parameters1,
};

const rejectedKey: StoreKey = {
  factory: rejectedFactory,
  parameters: parameters1,
};

const entry1: StoreState = {
  status: Status.Pending,
  value: undefined,
  error: undefined,
};

const entry2: StoreState = {
  status: Status.Fulfilled,
  value: 123456,
  error: undefined,
};

const nonExistentKey1: StoreKey = {
  factory: rejectedFactory,
  parameters: parameters1,
};

const nonExistentKey2: StoreKey = {
  factory: fulfilledFactory,
  parameters: parameters2,
};

describe('Store', () => {
  describe('.getState()', () => {
    test('returns unknown state when there is no state', () => {
      const store = new Store();
      store.setState(key, entry1);
      expect(store.getState(nonExistentKey1)).toEqual(
        expect.objectContaining(unknownState),
      );
      expect(store.getState(nonExistentKey2)).toEqual(
        expect.objectContaining(unknownState),
      );
    });

    test('returns the entry when there is an entry', () => {
      const cache = new Store();
      cache.setState(key, entry1);
      expect(cache.getState(key)).toEqual(entry1);
    });
  });

  describe('.setState()', () => {
    test('sets the value when there is no entry', () => {
      const cache = new Store();
      cache.setState(key, entry1);
      expect(cache.getState(key)).toEqual(entry1);
    });

    test('replaces the value when there is an entry', () => {
      const cache = new Store();
      cache.setState(key, entry1);
      cache.setState(key, entry2);
      expect(cache.getState(key)).toEqual(entry2);
    });
  });

  describe('.clearState()', () => {
    test('does nothing when there is no entry', () => {
      const cache = new Store();
      cache.clearState(key);
      expect(cache.getState(key)).toBeUndefined();
    });

    test('removes the entry when there is an entry', () => {
      const cache = new Store();
      cache.setState(key, entry1);
      cache.clearState(key);
      expect(cache.getState(key)).toBeUndefined();
    });
  });
});

describe('invoke()', () => {
  test('state transitions from pending to fulfilled when invoked', async () => {
    const cache = new Store();
    invoke(cache, fulfilledKey);
    await waitForExpect(() =>
      expect(cache.getState(fulfilledKey)).toEqual(
        expect.objectContaining({
          status: Status.Pending,
          value: undefined,
          error: undefined,
        }),
      ),
    );
    await waitForExpect(() =>
      expect(cache.getState(fulfilledKey)).toEqual(
        expect.objectContaining({
          status: Status.Fulfilled,
          value,
          error: undefined,
        }),
      ),
    );
  });

  test('state transitions from pending to rejected when invoked', async () => {
    const cache = new Store();
    invoke(cache, rejectedKey);
    await waitForExpect(() =>
      expect(cache.getState(rejectedKey)).toEqual(
        expect.objectContaining({
          status: Status.Pending,
          value: undefined,
          error: undefined,
        }),
      ),
    );
    await waitForExpect(() =>
      expect(cache.getState(rejectedKey)).toEqual(
        expect.objectContaining({
          status: Status.Rejected,
          value: undefined,
          error,
        }),
      ),
    );
  });
});

describe('createResource()', () => {
  describe('.read()', () => {
    test('should throw when pending', () => {
      const resource = createResource(createPendingPromise);
      expect(() => resource.read()).toThrow(expect.any(Promise));
    });

    test('should return when fulfilled', async () => {
      const resource = createResource(createFulfilledPromise);
      await waitForExpect(() => expect(resource.read()).toEqual(value));
    });

    test('should throw when rejected', async () => {
      const resource = createResource(createRejectedPromise);
      await waitForExpect(() =>
        expect(() => resource.read()).toThrowError(error),
      );
    });
  });
});
