import {Resource, Status} from './Resource';
import {
  createErroredObservable,
  waitingState,
  erroredState,
  unknownState,
  createWaitingObservable,
  createReceivedObservable,
  createCompletedObservable,
  receivedState,
  completedState,
} from './__fixtures__';
import {waitForExpect, waitForQueuedFunctions} from 'testing-utilities';
import {delay, fromArray} from '@jameslnewell/observable';
import {fromError} from '@jameslnewell/observable';

describe('Resource', () => {
  describe('.constructor()', () => {
    test('state is unknown when constructed without a factory', () => {
      const resource = new Resource(undefined);
      expect(resource.state).toEqual(unknownState);
    });

    test('state is unknown when constructed with a factory', () => {
      const resource = new Resource(createWaitingObservable);
      expect(resource.state).toEqual(unknownState);
    });
  });

  describe('.invoke()', () => {
    test('state is waiting when invoked', () => {
      const resource = new Resource(createWaitingObservable);
      resource.invoke();
      expect(resource.state).toEqual(waitingState);
    });

    test('state transitions to received when invoked', async () => {
      const resource = new Resource(createReceivedObservable);
      resource.invoke();
      await waitForExpect(() => expect(resource.state).toEqual(receivedState));
    });

    test('state transitions to completed when invoked', async () => {
      const resource = new Resource(createCompletedObservable);
      resource.invoke();
      await waitForExpect(() => expect(resource.state).toEqual(completedState));
    });

    test('state transitions to errored when invoked', async () => {
      const resource = new Resource(createErroredObservable);
      resource.invoke();
      await waitForExpect(() => expect(resource.state).toEqual(erroredState));
    });

    test('state transitions to completed when the second invocation transitions to completed even though the first invocation got to the sate sooner', async () => {
      const factory = jest
        .fn()
        .mockImplementationOnce(() => delay(5)(fromArray([1])))
        .mockImplementationOnce(() => delay(10)(fromArray([2])));
      const resource = new Resource(factory);
      resource.invoke();
      resource.invoke();
      await waitForExpect(() =>
        expect(resource.state).toEqual(
          expect.objectContaining({
            status: Status.Completed,
            value: 2,
          }),
        ),
      );
    });

    test('state transitions to errored when the second invocation transitions to errored even though the first invocation got to the sate sooner', async () => {
      const factory = jest
        .fn()
        .mockImplementationOnce(() => delay(5)(fromError(1)))
        .mockImplementationOnce(() => delay(10)(fromError(2)));
      const resource = new Resource(factory);
      resource.invoke();
      resource.invoke();
      await waitForExpect(() =>
        expect(resource.state).toEqual(
          expect.objectContaining({
            status: Status.Errored,
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
      const resource = new Resource(createWaitingObservable);
      resource.wait().finally(settled);
      resource.invoke();
      await waitForQueuedFunctions();
      expect(settled).not.toBeCalled();
    });

    test('resolves when state transitions to received', async () => {
      const settled = jest.fn();
      const resource = new Resource(createReceivedObservable);
      resource.wait().finally(settled);
      resource.invoke();
      await waitForQueuedFunctions();
      expect(settled).toBeCalled();
    });

    test('resolves when state transitions to completed', async () => {
      const settled = jest.fn();
      const resource = new Resource(createCompletedObservable);
      resource.wait().finally(settled);
      resource.invoke();
      await waitForQueuedFunctions();
      expect(settled).toBeCalled();
    });

    test('resolves when state transitions to errored', async () => {
      const settled = jest.fn();
      const resource = new Resource(createErroredObservable);
      resource.wait().finally(settled);
      resource.invoke();
      await waitForQueuedFunctions();
      expect(settled).toBeCalled();
    });

    test('resolves when state of second invocation transitions to received even though the first inovocation got to the same state sooner', async () => {
      const settled = jest.fn();
      const factory = jest
        .fn()
        .mockImplementationOnce(() => delay(5)(fromArray([1])))
        .mockImplementationOnce(() => delay(10)(fromArray([2])));
      const resource = new Resource(factory);
      resource.wait().finally(settled);
      resource.invoke();
      resource.invoke();
      await waitForExpect(() => expect(settled).toBeCalled());
      expect(resource.state).toEqual(
        expect.objectContaining({
          status: Status.Completed,
          value: 2,
        }),
      );
    });

    test('resolves when state of second invocation transitions to errored even though the first inovocation got to the same state sooner', async () => {
      const settled = jest.fn();
      const factory = jest
        .fn()
        .mockImplementationOnce(() => delay(5)(fromError(1)))
        .mockImplementationOnce(() => delay(10)(fromError(2)));
      const resource = new Resource(factory);
      resource.wait().finally(settled);
      resource.invoke();
      resource.invoke();
      await waitForExpect(() => expect(settled).toBeCalled());
      expect(resource.state).toEqual(
        expect.objectContaining({
          status: Status.Errored,
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
      const resource = new Resource(createWaitingObservable);
      resource.subscribe(subscriber);
      resource.invoke();
      expect(subscriber).toBeCalledWith(waitingState);
    });

    test('subscriber is notified when state transitions to received', async () => {
      const subscriber = jest.fn();
      const resource = new Resource(createReceivedObservable);
      resource.subscribe(subscriber);
      await resource.invoke();
      expect(subscriber).toBeCalledWith(receivedState);
    });

    test('subscriber is notified when state transitions to completed', async () => {
      const subscriber = jest.fn();
      const resource = new Resource(createCompletedObservable);
      resource.subscribe(subscriber);
      await resource.invoke();
      expect(subscriber).toBeCalledWith(completedState);
    });

    test('subscriber is notified when state transitions to errored', async () => {
      const subscriber = jest.fn();
      const resource = new Resource(createErroredObservable);
      resource.subscribe(subscriber);
      await resource.invoke();
      expect(subscriber).toBeCalledWith(erroredState);
    });

    test('subscriber is not notified when unsubscribed', () => {
      const subscriber = jest.fn();
      const resource = new Resource(createWaitingObservable);
      const unsubscribe = resource.subscribe(subscriber);
      unsubscribe();
      resource.invoke();
      expect(subscriber).not.toBeCalledWith(waitingState);
    });
  });
});
