import {
  delay,
  fromArray,
  firstValueFrom,
  fromError,
  Observable,
} from '@jameslnewell/observable';
import {waitForExpect} from 'testing-utilities';
import {
  createInvokable,
  createInvokableByParametersMap,
} from './createInvokable';
import {
  noop,
  createCompletedObservable,
  createWaitingObservable,
  createErroredObservable,
  error,
  erroredState,
  value,
  waitingState,
  completedState,
  createReceivedObservable,
  receivedState,
} from './__fixtures__';

// TODO: received state

const parameters: [] = [];

describe('createInvokable', () => {
  test('state is undefiend when the invokable has not been invoked', () => {
    const invokable = createInvokable(createWaitingObservable, parameters);
    expect(invokable.getState()).toBeUndefined();
  });

  test('state transitions to waiting when the invokable has been invoked', async () => {
    const invokable = createInvokable(createWaitingObservable, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(waitingState),
    );
  });

  test('state transitions to received when the invokable has been invoked and receieves', async () => {
    const invokable = createInvokable(createReceivedObservable, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(receivedState),
    );
  });

  test('state transitions to completed when the invokable has been invoked and completes', async () => {
    const invokable = createInvokable(createCompletedObservable, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(completedState),
    );
  });

  test('state transitions to errored when the invokable has been invoked and rejects', async () => {
    const invokable = createInvokable(createErroredObservable, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(erroredState),
    );
  });

  test('state is the result of the last invocation when invoked more than once and the last invocation resolves first', async () => {
    const invokable = createInvokable(
      jest
        .fn()
        .mockImplementationOnce(() => delay(10)(fromArray([1])))
        .mockImplementationOnce(() => delay(5)(fromArray([2]))),
      parameters,
    );
    await Promise.all([
      firstValueFrom(invokable.invoke()),
      firstValueFrom(invokable.invoke()),
    ]);
    expect(invokable.getState()?.value).toEqual(2);
  });

  test('state is the result of the last invocation when invoked more than once and the last invocation rejects first', async () => {
    const invokable = createInvokable(
      jest
        .fn()
        .mockImplementationOnce(() => delay(10)(fromError(1)))
        .mockImplementationOnce(() => delay(5)(fromError(2))),
      parameters,
    );
    await Promise.all([
      firstValueFrom(invokable.invoke()),
      firstValueFrom(invokable.invoke()),
    ]).catch(noop);
    expect(invokable.getState()?.error).toEqual(2);
  });

  test('state is undefiend when the invokable has been reset', async () => {
    const invokable = createInvokable(createCompletedObservable, parameters);
    invokable.invoke();
    await waitForExpect(() =>
      expect(invokable.getState()).toEqual(completedState),
    );
    invokable.reset();
    await waitForExpect(() => expect(invokable.getState()).toBeUndefined());
  });

  test('suspender is undefiend when the invokable has not been invoked', () => {
    const invokable = createInvokable(createWaitingObservable, parameters);
    expect(invokable.getSuspender()).toBeUndefined();
  });

  test('suspender is the result of the last invocation when invoked more than once and the last invocation starts last', async () => {
    const invokable = createInvokable(createCompletedObservable, parameters);
    invokable.invoke();
    const suspender1 = invokable.getSuspender();
    invokable.invoke();
    const suspender2 = invokable.getSuspender();
    await Promise.all([suspender1, suspender2]);
    expect(invokable.getSuspender()).toBe(suspender2);
  });

  test('suspender is undefiend when the invokable has been reset', () => {
    const invokable = createInvokable(createCompletedObservable, parameters);
    invokable.invoke();
    invokable.reset();
    expect(invokable.getSuspender()).toBeUndefined();
  });

  test.todo('returns an observable when invoked');

  test('subscriber is notified when subscribed', () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createWaitingObservable, parameters);
    invokable.subscribe(subscriber);
    expect(subscriber).toBeCalledWith(undefined);
  });

  test('subscriber is notified when subscribed and state transitions to pending', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createWaitingObservable, parameters);
    invokable.subscribe(subscriber);
    invokable.invoke();
    await waitForExpect(() => expect(subscriber).toBeCalledWith(waitingState));
  });

  test('subscriber is notified when subscribed and state transitions to fulfilled', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createCompletedObservable, parameters);
    invokable.subscribe(subscriber);
    invokable.invoke();
    await waitForExpect(() =>
      expect(subscriber).toBeCalledWith(completedState),
    );
  });

  test('subscriber is notified when subscribed and state transitions to rejected', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createErroredObservable, parameters);
    invokable.subscribe(subscriber);
    invokable.invoke();
    await waitForExpect(() => expect(subscriber).toBeCalledWith(erroredState));
  });

  test('subscriber is notified when subscribed and state is reset', async () => {
    const subscriber = jest.fn();
    const invokable = createInvokable(createWaitingObservable, parameters);
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
    >(createWaitingObservable);
    const invokable1 = map.get([() => console.log('Hello World!'), 123, 'abc']);
    const invokable2 = map.get([() => console.log('Hello World!'), 123, 'abc']);
    expect(invokable1).toBe(invokable2);
  });

  test('shallow inequal arrays are not considered to have the same parameters', () => {
    const map = createInvokableByParametersMap<
      [() => void, number, string],
      unknown
    >(createWaitingObservable);
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
