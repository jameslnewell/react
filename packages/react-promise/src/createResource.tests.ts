import {waitForExpect, waitForQueuedFunctions} from 'testing-utilities';
import {Resource, Status} from './createResource';
import {
  noop,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  fulfilledState,
  pendingState,
  rejectedState,
  unknownState,
  createDelay,
} from './__fixtures__';

describe('Resource', () => {
  describe('.constructor()', () => {
    test('state is unknown when constructed without a factory', () => {
      const resource = new Resource(undefined);
      expect(resource.state).toEqual(unknownState);
    });

    test('state is unknown when constructed with a factory', () => {
      const resource = new Resource(createPendingPromise);
      expect(resource.state).toEqual(unknownState);
    });
  });

  describe('.invoke()', () => {
    test('state is pending when invoked', () => {
      const resource = new Resource(createPendingPromise);
      resource.invoke();
      expect(resource.state).toEqual(pendingState);
    });

    test('state transitions to fulfilled when invoked', async () => {
      const resource = new Resource(createFulfilledPromise);
      resource.invoke();
      await waitForExpect(() => expect(resource.state).toEqual(fulfilledState));
    });

    test('state transitions to rejected when invoked', async () => {
      const resource = new Resource(createRejectedPromise);
      resource.invoke().catch(noop);
      await waitForExpect(() => expect(resource.state).toEqual(rejectedState));
    });

    test('state transitions to fullfilled when the second invocation transitions to fulfilled even though the first invocation got to the sate sooner', async () => {
      const factory = jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.resolve(1), 5))
        .mockImplementationOnce(createDelay(() => Promise.resolve(2), 10));
      const resource = new Resource(factory);
      resource.invoke();
      resource.invoke();
      await waitForExpect(() =>
        expect(resource.state).toEqual(
          expect.objectContaining({
            status: Status.Fulfilled,
            value: 2,
          }),
        ),
      );
    });

    test('state transitions to rejected when the second invocation transitions to rejected even though the first invocation got to the sate sooner', async () => {
      const factory = jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.reject(1), 5))
        .mockImplementationOnce(createDelay(() => Promise.reject(2), 10));
      const resource = new Resource(factory);
      resource.invoke().catch(noop);
      resource.invoke().catch(noop);
      await waitForExpect(() =>
        expect(resource.state).toEqual(
          expect.objectContaining({
            status: Status.Rejected,
            error: 2,
          }),
        ),
      );
    });
  });

  describe('.wait()', () => {
    test('pending when state is unknown', async () => {
      const settled = jest.fn();
      const resource = new Resource(undefined);
      resource.wait().finally(settled);
      await waitForQueuedFunctions();
      expect(settled).not.toBeCalled();
    });

    test('pending when state transitions to waiting', async () => {
      const settled = jest.fn();
      const resource = new Resource(createPendingPromise);
      resource.wait().finally(settled);
      resource.invoke();
      await waitForQueuedFunctions();
      expect(settled).not.toBeCalled();
    });

    test('resolves when state transitions to fulfilled', async () => {
      const settled = jest.fn();
      const resource = new Resource(createFulfilledPromise);
      resource.wait().finally(settled);
      resource.invoke();
      await waitForQueuedFunctions();
      expect(settled).toBeCalled();
    });

    test('resolves when state transitions to rejected', async () => {
      const settled = jest.fn();
      const resource = new Resource(createRejectedPromise);
      resource.wait().finally(settled);
      resource.invoke().catch(noop);
      await waitForQueuedFunctions();
      expect(settled).toBeCalled();
    });

    test('resolves when state of second invocation transitions to fulfilled even though the first inovocation got to the same state sooner', async () => {
      const settled = jest.fn();
      const factory = jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.resolve(1), 5))
        .mockImplementationOnce(createDelay(() => Promise.resolve(2), 10));
      const resource = new Resource(factory);
      resource.wait().finally(settled);
      resource.invoke();
      resource.invoke();
      await waitForExpect(() => expect(settled).toBeCalled());
      expect(resource.state).toEqual(
        expect.objectContaining({
          status: Status.Fulfilled,
          value: 2,
        }),
      );
    });

    test('resolves when state of second invocation transitions to rejected even though the first inovocation got to the same state sooner', async () => {
      const settled = jest.fn();
      const factory = jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.reject(1), 5))
        .mockImplementationOnce(createDelay(() => Promise.reject(2), 10));
      const resource = new Resource(factory);
      resource.wait().finally(settled);
      resource.invoke().catch(noop);
      resource.invoke().catch(noop);
      await waitForExpect(() => expect(settled).toBeCalled());
      expect(resource.state).toEqual(
        expect.objectContaining({
          status: Status.Rejected,
          error: 2,
        }),
      );
    });
  });

  describe('.subscribe()', () => {
    test('subscriber is notified when first subscribed', () => {
      const subscriber = jest.fn();
      const resource = new Resource(undefined);
      resource.subscribe(subscriber);
      expect(subscriber).toBeCalledWith(unknownState);
    });

    test('subscriber is notified when state transitions to waiting', () => {
      const subscriber = jest.fn();
      const resource = new Resource(createPendingPromise);
      resource.subscribe(subscriber);
      resource.invoke();
      expect(subscriber).toBeCalledWith(pendingState);
    });

    test('subscriber is notified when state transitions to fulfilled', async () => {
      const subscriber = jest.fn();
      const resource = new Resource(createFulfilledPromise);
      resource.subscribe(subscriber);
      await resource.invoke();
      expect(subscriber).toBeCalledWith(fulfilledState);
    });

    test('subscriber is notified when state transitions to rejected', async () => {
      const subscriber = jest.fn();
      const resource = new Resource(createRejectedPromise);
      resource.subscribe(subscriber);
      await resource.invoke().catch(noop);
      expect(subscriber).toBeCalledWith(rejectedState);
    });

    test('subscriber is not notified when unsubscribed', () => {
      const subscriber = jest.fn();
      const resource = new Resource(createPendingPromise);
      const unsubscribe = resource.subscribe(subscriber);
      unsubscribe();
      resource.invoke();
      expect(subscriber).not.toBeCalledWith(pendingState);
    });
  });
});
