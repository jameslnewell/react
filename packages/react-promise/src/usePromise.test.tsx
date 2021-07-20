import {renderHook} from '@testing-library/react-hooks';
import {usePromise} from './usePromise';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  error,
  value,
} from './__fixtures__';
import {
  createErroredState,
  createLoadedState,
  createLoadingState,
} from './state';
import {Status} from './status';

function renderUsePromise(
  promise: Promise<unknown>,
): ReturnType<typeof renderHook> {
  return renderHook(() => usePromise(promise));
}

describe('usePromise()', () => {
  test('is loading when waiting', () => {
    const {result} = renderUsePromise(createPendingPromise());
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
  });
  test('is loaded when fulfilled', async () => {
    const {result, waitForValueToChange} = renderUsePromise(
      createFulfilledPromise(),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('is errored when rejected', async () => {
    const {result, waitForValueToChange} = renderUsePromise(
      createRejectedPromise(),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('eventually loads', async () => {
    const {result, waitForValueToChange} = renderUsePromise(
      createEventuallyFulfilledPromise(),
    );
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('eventually errors', async () => {
    const {result, waitForValueToChange} = renderUsePromise(
      createEventuallyRejectedPromise(),
    );
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('rendered with a new promise', async () => {
    const promise1 = new Promise<string>((resolve) =>
      setTimeout(() => resolve('foo'), 500),
    );
    const promise2 = new Promise<string>((resolve) =>
      setTimeout(() => resolve('bar'), 500),
    );
    const {result, rerender, waitForValueToChange} = renderHook(
      ({promise}: {promise: Promise<string>}) => usePromise(promise),
      {initialProps: {promise: promise1}},
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Loading,
        value: undefined,
        error: undefined,
      }),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Loaded,
        value: 'foo',
        error: undefined,
      }),
    );
    rerender({promise: promise2});
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Loading,
        value: undefined,
        error: undefined,
      }),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Loaded,
        value: 'bar',
        error: undefined,
      }),
    );
  });
});
