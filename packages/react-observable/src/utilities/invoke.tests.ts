import {waitForExpect} from 'testing-utilities';
import {Store} from '../Store';
import {Status} from '../types';
import {invoke} from './invoke';
import {
  value,
  error,
  createCompletedObservable,
  createErroredObservable,
} from '../__fixtures__';

const key = ['a', 'b', 'c'];

describe('invoke()', () => {
  test('state transitions from pending to completed when invoked', async () => {
    const store = new Store();
    invoke({
      store,
      key,
      factory: createCompletedObservable,
      parameters: [],
    });
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Waiting,
          value: undefined,
          error: undefined,
        }),
      ),
    );
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Completed,
          value,
          error: undefined,
        }),
      ),
    );
  });

  test('state transitions from pending to errored when invoked', async () => {
    const store = new Store();
    invoke({
      store,
      key,
      factory: createErroredObservable,
      parameters: [],
    }).catch(() => {
      /* do nothing */
    });
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Waiting,
          value: undefined,
          error: undefined,
        }),
      ),
    );
    await waitForExpect(() =>
      expect(store.getState(key)).toEqual(
        expect.objectContaining({
          status: Status.Errored,
          value: undefined,
          error,
        }),
      ),
    );
  });
});
