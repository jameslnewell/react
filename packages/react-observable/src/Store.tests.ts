import {waitForExpect} from 'testing-utilities';
import {Store, StoreState, StoreKey} from './Store';
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

const key1: StoreKey = [fulfilledFactory, ...parameters1];
const key2: StoreKey = [rejectedFactory, ...parameters1];
const key3: StoreKey = [fulfilledFactory, ...parameters2];

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

describe('Store', () => {
  describe('.getState()', () => {
    test('returns unknown state when there is no state', () => {
      const store = new Store();
      store.setState(key1, entry1);
      expect(store.getState(key2)).toEqual(
        expect.objectContaining(unknownState),
      );
      expect(store.getState(key3)).toEqual(
        expect.objectContaining(unknownState),
      );
    });

    test('returns the entry when there is an entry', () => {
      const cache = new Store();
      cache.setState(key1, entry1);
      expect(cache.getState(key1)).toEqual(entry1);
    });
  });

  describe('.setState()', () => {
    test('sets the value when there is no entry', () => {
      const cache = new Store();
      cache.setState(key1, entry1);
      expect(cache.getState(key1)).toEqual(entry1);
    });

    test('replaces the value when there is an entry', () => {
      const cache = new Store();
      cache.setState(key1, entry1);
      cache.setState(key1, entry2);
      expect(cache.getState(key1)).toEqual(entry2);
    });
  });

  describe('.clearState()', () => {
    test('does nothing when there is no entry', () => {
      const cache = new Store();
      cache.clearState(key1);
      expect(cache.getState(key1)).toEqual(unknownState);
    });

    test('removes the entry when there is an entry', () => {
      const cache = new Store();
      cache.setState(key1, entry1);
      cache.clearState(key1);
      expect(cache.getState(key1)).toEqual(unknownState);
    });
  });
});
