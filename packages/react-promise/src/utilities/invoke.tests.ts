import {waitForExpect} from 'testing-utilities';
import {Store} from '../Store';
import {Status} from '../types';
import {invoke} from './invoke';
import {
  value,
  error,
  createFulfilledPromise,
  createRejectedPromise,
} from '../__fixtures__';

const key = ['a', 'b', 'c'];

describe('invoke()', () => {
  test('state transitions from pending to fulfilled when invoked', async () => {
    const store = new Store();
    invoke({
      store,
      key,
      factory: createFulfilledPromise,
      parameters: [],
    });
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Pending,
          value: undefined,
          error: undefined,
        }),
      ),
    );
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Fulfilled,
          value,
          error: undefined,
        }),
      ),
    );
  });

  test('state transitions from pending to rejected when invoked', async () => {
    const store = new Store();
    invoke({
      store,
      key,
      factory: createRejectedPromise,
      parameters: [],
    }).catch(() => {
      /* do nothing */
    });
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Pending,
          value: undefined,
          error: undefined,
        }),
      ),
    );
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Rejected,
          value: undefined,
          error,
        }),
      ),
    );
  });
});
