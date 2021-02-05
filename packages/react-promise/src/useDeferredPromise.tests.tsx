import '@testing-library/jest-dom/extend-expect';
import React, {useEffect} from 'react';
import {act, renderHook, RenderHookResult} from '@testing-library/react-hooks';
import {render} from '@testing-library/react';
import {ErrorBoundary} from 'react-error-boundary';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
  UseDeferredPromiseResult,
} from './useDeferredPromise';
import {
  value,
  error,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  noop,
  createDelay,
} from './__fixtures__';
import {Factory, Status} from './createResource';

function renderUseDeferredPromiseHook<
  Parameters extends unknown[] = [],
  Value = unknown,
  Error = unknown
>(
  fn: Factory<Parameters, Value> | undefined,
  opts?: UseDeferredPromiseOptions,
): RenderHookResult<
  unknown,
  UseDeferredPromiseResult<Parameters, Value, Error>
> {
  return renderHook(() => useDeferredPromise(fn, opts));
}

describe('useDeferredPromise()', () => {
  test('state is undefined when mounted', () => {
    const {result} = renderUseDeferredPromiseHook(createPendingPromise);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        value: undefined,
        error: undefined,
      }),
    );
  });

  test('throws an error when invoked without a fn', () => {
    const {result} = renderUseDeferredPromiseHook(undefined);
    act(() => {
      expect(() => result.current.invokeAsync()).toThrow(
        `No factory provided.`,
      );
    });
  });

  test('state is pending when invoked', () => {
    const {result} = renderUseDeferredPromiseHook(createPendingPromise);
    act(() => {
      result.current.invokeAsync();
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        value: undefined,
        error: undefined,
      }),
    );
  });

  test('state transitions to fulfilled when invoked', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      createFulfilledPromise,
    );
    act(() => {
      result.current.invokeAsync();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Fulfilled,
        value,
        error: undefined,
      }),
    );
  });

  test('state transitions to rejected when invoked', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      createRejectedPromise,
    );
    act(() => {
      result.current.invokeAsync().catch(noop);
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Rejected,
        value: undefined,
        error,
      }),
    );
  });

  test('returns a value when invoked and fulfilled', async () => {
    const {result} = renderUseDeferredPromiseHook(createFulfilledPromise);
    await act(async () => {
      await expect(result.current.invokeAsync()).resolves.toEqual(value);
    });
  });

  test('throws an error when invoked and rejected', async () => {
    const {result} = renderUseDeferredPromiseHook(createRejectedPromise);
    await act(async () => {
      await expect(result.current.invokeAsync()).rejects.toEqual(error);
    });
  });

  test('uses result from last invoked promise even when the previously invoked promise finishes last', async () => {
    const fn = jest
      .fn()
      .mockImplementationOnce(createDelay(() => Promise.resolve(1), 100))
      .mockImplementationOnce(createDelay(() => Promise.resolve(2), 50));
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(fn);
    act(() => {
      result.current.invokeAsync();
      result.current.invokeAsync();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({value: 2}));
  });

  test('uses error from last invoked promise even when the previously invoked promise finishes last', async () => {
    const fn = jest
      .fn()
      .mockImplementationOnce(createDelay(() => Promise.reject(1), 100))
      .mockImplementationOnce(createDelay(() => Promise.reject(2), 50));
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(fn);
    act(() => {
      result.current.invokeAsync().catch(noop);
      result.current.invokeAsync().catch(noop);
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({error: 2}));
  });

  test('suspends when pending and suspendWhenPending=true', () => {
    const Component: React.FC = () => {
      const {invoke} = useDeferredPromise(createPendingPromise, {
        suspendWhenPending: true,
      });
      useEffect(() => invoke(), [invoke]);
      return <h1>Loaded!</h1>;
    };
    const {queryByText} = render(
      <React.Suspense fallback={<p>Loading...</p>}>
        <Component />
      </React.Suspense>,
    );
    expect(queryByText('Loading...')).toBeVisible();
    expect(queryByText('Loaded!')).not.toBeVisible();
  });

  test('throws when rejected and throwWhenRejected=true', () => {
    jest.spyOn(console, 'error').mockImplementation(noop);
    const Component: React.FC = () => {
      const {invoke} = useDeferredPromise(createPendingPromise, {
        suspendWhenPending: true,
      });
      useEffect(() => invoke(), [invoke]);
      return <h1>Loaded!</h1>;
    };
    const {queryByText} = render(
      <ErrorBoundary fallbackRender={() => <h1>Error!</h1>}>
        <Component />
      </ErrorBoundary>,
    );
    expect(queryByText('Error!')).toBeVisible();
    expect(queryByText('Loaded!')).toBeNull();
  });
});
