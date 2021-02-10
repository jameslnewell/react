import {waitForExpect} from 'testing-utilities';
import {
  createInvokable,
  createInvokableByParametersMap,
} from './createInvokable';
import {
  createDelay,
  noop,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  error,
  fulfilledState,
  pendingState,
  rejectedState,
  value,
} from './__fixtures__';

const parameters: [] = [];

describe('createInvokable', () => {
  test('state is undefiend when the invokable has not been invoked', () => {
    const invokable = createInvokable(createPendingPromise, parameters);
    expect(invokable.getState()).toBeUndefined();
  });

  test('state transitions to pending when the invokable has been invoked', async () => {
    const invokable = createInvokable(createPendingPromise, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(pendingState),
    );
  });

  test('state transitions to fulfilled when the invokable has been invoked and resolves', async () => {
    const invokable = createInvokable(createFulfilledPromise, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(fulfilledState),
    );
  });

  test('state transitions to rejected when the invokable has been invoked and rejects', async () => {
    const invokable = createInvokable(createRejectedPromise, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(rejectedState),
    );
  });

  test('state is the result of the last invocation when invoked more than once and the last invocation resolves first', async () => {
    const invokable = createInvokable(
      jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.resolve(1), 10))
        .mockImplementationOnce(createDelay(() => Promise.resolve(2), 5)),
      parameters,
    );
    await Promise.all([invokable.invoke(), invokable.invoke()]);
    expect(invokable.getState()?.value).toEqual(2);
  });

  test('state is the result of the last invocation when invoked more than once and the last invocation rejects first', async () => {
    const invokable = createInvokable(
      jest
        .fn()
        .mockImplementationOnce(createDelay(() => Promise.reject(1), 10))
        .mockImplementationOnce(createDelay(() => Promise.reject(2), 5)),
      parameters,
    );
    await Promise.all([invokable.invoke(), invokable.invoke()]).catch(noop);
    expect(invokable.getState()?.error).toEqual(2);
  });

  test('state is undefiend when the invokable has been reset', async () => {
    const invokable = createInvokable(createFulfilledPromise, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(fulfilledState),
    );
    invokable.reset();
    await waitForExpect(() => expect(invokable.getState()).toBeUndefined());
  });

  test('suspender is undefiend when the invokable has not been invoked', () => {
    const invokable = createInvokable(createPendingPromise, parameters);
    expect(invokable.getSuspender()).toBeUndefined();
  });

  test('suspender is the result of the last invocation when invoked more than once and the last invocation starts last', async () => {
    const invokable = createInvokable(createFulfilledPromise, parameters);
    invokable.invoke();
    const suspender1 = invokable.getSuspender();
    invokable.invoke();
    const suspender2 = invokable.getSuspender();
    await Promise.all([suspender1, suspender2]);
    expect(invokable.getSuspender()).toBe(suspender2);
  });

  test('suspender is undefiend when the invokable has been reset', () => {
    const invokable = createInvokable(createFulfilledPromise, parameters);
    invokable.invoke();
    invokable.reset();
    expect(invokable.getSuspender()).toBeUndefined();
  });

  test('resolves with invokable value when invoked', async () => {
    const invokable = createInvokable(createFulfilledPromise, parameters);
    await expect(invokable.invoke()).resolves.toEqual(value);
  });

  test('rejects with invokable error when invoked', async () => {
    const invokable = createInvokable(createRejectedPromise, parameters);
    await expect(invokable.invoke()).rejects.toEqual(error);
  });

  test('subscriber is notified when subscribed', () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createPendingPromise, parameters);
    invokable.subscribe(subscriber);
    expect(subscriber).toBeCalledWith(undefined);
  });

  test('subscriber is notified when subscribed and state transitions to pending', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createPendingPromise, parameters);
    invokable.subscribe(subscriber);
    invokable.invoke();
    await waitForExpect(() => expect(subscriber).toBeCalledWith(pendingState));
  });

  test('subscriber is notified when subscribed and state transitions to fulfilled', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createFulfilledPromise, parameters);
    invokable.subscribe(subscriber);
    invokable.invoke();
    await waitForExpect(() =>
      expect(subscriber).toBeCalledWith(fulfilledState),
    );
  });

  test('subscriber is notified when subscribed and state transitions to rejected', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createRejectedPromise, parameters);
    invokable.subscribe(subscriber);
    invokable.invoke();
    await waitForExpect(() => expect(subscriber).toBeCalledWith(rejectedState));
  });

  test('subscriber is notified when subscribed and state is reset', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createPendingPromise, parameters);
    invokable.subscribe(subscriber);
    invokable.invoke();
    invokable.reset();
    await waitForExpect(() => expect(subscriber).toBeCalledWith(undefined));
  });
});

describe('createInvokableByParametersMap()', () => {
  test('shallow equal arrays are considered to havethe same parameters', () => {
    const map = createInvokableByParametersMap<
      [() => void, number, string],
      unknown
    >(createPendingPromise);
    const invokable1 = map.get([() => console.log('Hello World!'), 123, 'abc']);
    const invokable2 = map.get([() => console.log('Hello World!'), 123, 'abc']);
    expect(invokable1).toBe(invokable2);
  });

  test('shallow inequal arrays are not considered to have the same parameters', () => {
    const map = createInvokableByParametersMap<
      [() => void, number, string],
      unknown
    >(createPendingPromise);
    const invokable1 = map.get([() => console.log('Hello World!'), 123, 'abc']);
    const invokable2 = map.get([() => console.log('World Hello!'), 123, 'abc']);
    const invokable3 = map.get([() => console.log('Hello World!'), 456, 'abc']);
    const invokable4 = map.get([() => console.log('Hello World!'), 123, 'def']);
    expect(invokable1).not.toBe(invokable2);
    expect(invokable1).not.toBe(invokable3);
    expect(invokable1).not.toBe(invokable4);
    expect(invokable2).not.toBe(invokable3);
    expect(invokable2).not.toBe(invokable4);
    expect(invokable3).not.toBe(invokable4);
  });
});
