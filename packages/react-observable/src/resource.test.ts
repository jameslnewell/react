import {createResource, useResource} from './resource';
import {
  value,
  error,
  createWaitingObservable,
  createErroredObservable,
  createReceivedObservable,
  createCompletedObservable,
  createReceivingObservable,
} from './__fixtures__';
import {waitForExpect} from 'testing-utilities';
import {renderHook} from '@testing-library/react-hooks';
import {Status} from './types';

describe('createResource()', () => {
  test('read() should throw a promise when the observable is yet to emit a value', () => {
    expect.assertions(1);
    const resource = createResource(createWaitingObservable());
    try {
      resource.read();
    } catch (e) {
      expect(e).toBeInstanceOf(Promise);
    }
  });

  test('read() should return value when the observable has emitted a value', async () => {
    expect.assertions(1);
    const resource = createResource(createReceivedObservable());
    try {
      resource.read();
    } catch (e) {
      await e;
    }
    expect(resource.read()).toEqual(value);
  });

  test('read() should return value when the observable has completed', async () => {
    expect.assertions(1);
    const resource = createResource(createCompletedObservable());
    try {
      resource.read();
    } catch (e) {
      await e;
    }
    expect(resource.read()).toEqual(value);
  });

  test('read() should throw an error when the observable has errored', async () => {
    expect.assertions(1);
    const resource = createResource(createErroredObservable());
    try {
      resource.read();
    } catch (e) {
      await e;
    }
    try {
      resource.read();
    } catch (e) {
      expect(e).toEqual(error);
    }
  });

  test('is notified of state changes until unsubscribed', async () => {
    const observer = jest.fn();
    const resource = createResource(createReceivingObservable());
    const unsubscribe = resource.subscribe(observer);
    try {
      resource.read();
    } catch (e) {
      await e;
    }
    await waitForExpect(() => expect(resource.read()).toEqual(0));
    await waitForExpect(() => expect(resource.read()).toEqual(1));
    await waitForExpect(() => expect(resource.read()).toEqual(2));
    unsubscribe();
    // loading state may be skipped for synchronous observables
    // expect(observer).toBeCalledWith(
    //   expect.objectContaining({
    //     status: Status.Loading,
    //     value: undefined,
    //     error: undefined,
    //   }),
    // );
    expect(observer).toBeCalledWith(
      expect.objectContaining({
        status: Status.Loaded,
        value: 0,
        error: undefined,
      }),
    );
    expect(observer).toBeCalledWith(
      expect.objectContaining({
        status: Status.Loaded,
        value: 1,
        error: undefined,
      }),
    );
  });
});

describe('useResource()', () => {
  test('values are updated', async () => {
    const resource = createResource(createReceivingObservable());
    const {result, waitForValueToChange} = renderHook(() =>
      useResource(resource),
    );
    // suspended
    expect(result.current).toBeUndefined();
    await waitForValueToChange(() => result.current);
    // next
    expect(result.current).toEqual(0);
    await waitForValueToChange(() => result.current);
    // next
    expect(result.current).toEqual(1);
    await waitForValueToChange(() => result.current);
    // next
    expect(result.current).toEqual(2);
  });
  // TODO: unsubscribe after unmount
});
