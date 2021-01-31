import {Resource} from './Resource';
import {
  noop,
  value,
  error,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  fulfilledState,
  pendingState,
  rejectedState,
  uninitialisedState,
  createDelay,
} from './__fixtures__';

describe('Resource', () => {
  test('state is uninitialised when constructed', () => {
    const resource = new Resource();
    expect(resource.getState()).toEqual(uninitialisedState);
  });

  test('state is pending when invoked', () => {
    const resource = new Resource();
    resource.invoke(createPendingPromise, []);
    expect(resource.getState()).toEqual(pendingState);
  });

  test('state transitions to fulfilled when invoked', async () => {
    const resource = new Resource();
    await resource.invoke(createFulfilledPromise, []);
    expect(resource.getState()).toEqual(fulfilledState);
  });

  test('state transitions to rejected when invoked', async () => {
    const resource = new Resource();
    await resource.invoke(createRejectedPromise, []).catch(noop);
    expect(resource.getState()).toEqual(rejectedState);
  });

  test('state transitions to fulfilled using the most recent promise when invoked multiple times', async () => {
    const factory = jest
      .fn()
      .mockImplementationOnce(createDelay(() => Promise.resolve(1), 100))
      .mockImplementationOnce(createDelay(() => Promise.resolve(2), 50));
    const resource = new Resource();
    await Promise.all([
      resource.invoke(factory, []),
      resource.invoke(factory, []),
    ]);
    await expect(resource.getState()).toEqual(
      expect.objectContaining({value: 2}),
    );
  });

  test('state transitions to rejected using the most recent promise when invoked multiple times', async () => {
    const factory = jest
      .fn()
      .mockImplementationOnce(createDelay(() => Promise.reject(1), 100))
      .mockImplementationOnce(createDelay(() => Promise.reject(2), 50));
    const resource = new Resource();
    await Promise.all([
      resource.invoke(factory, []).catch(noop),
      resource.invoke(factory, []).catch(noop),
    ]);
    await expect(resource.getState()).toEqual(
      expect.objectContaining({error: 2}),
    );
  });

  test('state is uninitialised when reset', async () => {
    const resource = new Resource();

    resource.invoke(createPendingPromise, []);
    resource.reset();
    expect(resource.getState()).toEqual(uninitialisedState);

    await resource.invoke(createFulfilledPromise, []);
    resource.reset();
    expect(resource.getState()).toEqual(uninitialisedState);

    await resource.invoke(createRejectedPromise, []).catch(noop);
    resource.reset();
    expect(resource.getState()).toEqual(uninitialisedState);
  });

  describe('.wait()', () => {
    test('resolves when uninitialised', async () => {
      const resource = new Resource();
      await resource.wait();
    });

    test('resolves when fulfilled', async () => {
      const resource = new Resource();
      await resource.invoke(createFulfilledPromise, []);
      await resource.wait();
    });

    test('resolves when rejected', async () => {
      const resource = new Resource();
      await resource.invoke(createRejectedPromise, []).catch(noop);
      await resource.wait();
    });

    test.skip('waits when pending', async () => {
      const resource = new Resource();
      await resource.invoke(createPendingPromise, []).catch(noop);
      await resource.wait();
    });

    test('waits for most recent promise to be fulfilled', async () => {
      let fulfilled = false;
      let rejected = false;
      const factory = jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.resolve(1), 5))
        .mockImplementationOnce(createDelay(() => Promise.resolve(2), 10));
      const resource = new Resource();
      const invoke1 = resource.invoke(factory, [1]);
      resource.wait().then(
        () => (fulfilled = true),
        () => (rejected = true),
      );
      const invoke2 = resource.invoke(factory, [2]);
      await invoke1;
      expect(fulfilled).toBeFalsy();
      expect(rejected).toBeFalsy();
      await invoke2;
      expect(fulfilled).toBeTruthy();
      expect(rejected).toBeFalsy();
    });

    test('waits for most recent promise to be rejected', async () => {
      let fulfilled = false;
      let rejected = false;
      const factory = jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.reject(1), 5))
        .mockImplementationOnce(createDelay(() => Promise.reject(2), 10));
      const resource = new Resource();
      const invoke1 = resource.invoke(factory, [1]).catch(noop);
      resource.wait().then(
        () => (fulfilled = true),
        () => (rejected = true),
      );
      const invoke2 = resource.invoke(factory, [2]).catch(noop);
      await invoke1;
      expect(fulfilled).toBeFalsy();
      expect(rejected).toBeFalsy();
      await invoke2;
      expect(fulfilled).toBeFalsy();
      expect(rejected).toBeTruthy();
    });
  });

  test('subscriber is notified when subscribed', () => {
    const subscriber = jest.fn();
    const resource = new Resource();
    resource.subscribe(subscriber);
    expect(subscriber).toBeCalledWith(uninitialisedState);
  });

  test('subscriber is notified when transitioned to pending', () => {
    const subscriber = jest.fn();
    const resource = new Resource();
    resource.subscribe(subscriber);
    resource.invoke(createPendingPromise, []);
    expect(subscriber).toBeCalledWith(pendingState);
  });

  test('subscriber is notified when transitioned to fulfilled', async () => {
    const subscriber = jest.fn();
    const resource = new Resource();
    resource.subscribe(subscriber);
    await resource.invoke(createFulfilledPromise, []);
    expect(subscriber).toBeCalledWith(fulfilledState);
  });

  test('subscriber is notified when transitioned to rejected', async () => {
    const subscriber = jest.fn();
    const resource = new Resource();
    resource.subscribe(subscriber);
    await resource.invoke(createRejectedPromise, []).catch(noop);
    expect(subscriber).toBeCalledWith(rejectedState);
  });

  test('subscriber is not notified when unsubscribed', () => {
    const subscriber = jest.fn();
    const resource = new Resource();
    const unsubscribe = resource.subscribe(subscriber);
    unsubscribe();
    resource.invoke(createPendingPromise, []);
    expect(subscriber).not.toBeCalledWith(pendingState);
  });
});
