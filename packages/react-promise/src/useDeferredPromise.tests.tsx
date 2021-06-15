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
  unknownState,
  fulfilledState,
  pendingState,
  rejectedState,
} from './__fixtures__';
import {Factory} from './types';
import {waitForExpect} from 'testing-utilities';
import {cache} from './cache';

function renderUseDeferredPromiseHook<
  Parameters extends unknown[] = [],
  Value = unknown,
>(
  keys: unknown[],
  factory: Factory<Parameters, Value>,
  options?: UseDeferredPromiseOptions,
): RenderHookResult<unknown, UseDeferredPromiseResult<Parameters, Value>> {
  return renderHook(() => useDeferredPromise(keys, factory, options));
}

describe('useDeferredPromise()', () => {
  beforeEach(() => {
    cache.clear();
  });

  test('state is undefined when mounted', () => {
    const {result} = renderUseDeferredPromiseHook([], createPendingPromise);
    expect(result.current).toEqual(expect.objectContaining(unknownState));
  });

  test('state is pending when invoked', () => {
    const {result} = renderUseDeferredPromiseHook([], createPendingPromise);
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(expect.objectContaining(pendingState));
  });

  test('state transitions to fulfilled when invoked', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      [],
      createFulfilledPromise,
    );
    act(() => {
      result.current.invoke();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining(fulfilledState));
  });

  test('state transitions to rejected when invoked', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      [],
      createRejectedPromise,
    );
    act(() => {
      result.current.invoke().catch(noop);
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining(rejectedState));
  });

  test('returns a value when invoked and fulfilled', async () => {
    const {result} = renderUseDeferredPromiseHook([], createFulfilledPromise);
    await act(async () => {
      await expect(result.current.invoke()).resolves.toEqual(value);
    });
  });

  test('throws an error when invoked and rejected', async () => {
    const {result} = renderUseDeferredPromiseHook([], createRejectedPromise);
    await act(async () => {
      await expect(result.current.invoke()).rejects.toEqual(error);
    });
  });

  test('uses result from last invoked promise even when the previously invoked promise finishes last', async () => {
    const fn = jest
      .fn()
      .mockImplementationOnce(createDelay(() => Promise.resolve(1), 100))
      .mockImplementationOnce(createDelay(() => Promise.resolve(2), 50));
    const {result, waitFor} = renderUseDeferredPromiseHook([], fn);
    act(() => {
      result.current.invoke();
      result.current.invoke();
    });
    await waitFor(() =>
      expect(result.current).toEqual(expect.objectContaining({value: 2})),
    );
  });

  test('uses error from last invoked promise even when the previously invoked promise finishes last', async () => {
    const fn = jest
      .fn()
      .mockImplementationOnce(createDelay(() => Promise.reject(3), 100))
      .mockImplementationOnce(createDelay(() => Promise.reject(4), 50));
    const {result, waitFor} = renderUseDeferredPromiseHook([], fn);
    act(() => {
      result.current.invoke().catch(noop);
      result.current.invoke().catch(noop);
    });
    await waitFor(() =>
      expect(result.current).toEqual(expect.objectContaining({error: 4})),
    );
  });

  test('suspends when pending and suspendWhenPending=true', async () => {
    const Component: React.FC = () => {
      const {invoke} = useDeferredPromise([], createPendingPromise, {
        suspendWhenPending: true,
      });
      useEffect(() => {
        invoke();
      }, [invoke]);
      return <h1>Loaded!</h1>;
    };
    const {queryByText} = render(
      <React.Suspense fallback={<p>Loading...</p>}>
        <Component />
      </React.Suspense>,
    );
    await waitForExpect(() => {
      expect(queryByText('Loading...')).toBeVisible();
      expect(queryByText('Loaded!')).not.toBeVisible();
    });
  });

  test.only('throws when rejected and throwWhenRejected=true', async () => {
    jest.spyOn(console, 'error').mockImplementation(noop);
    const Component: React.FC = () => {
      const {invoke} = useDeferredPromise([], createPendingPromise, {
        suspendWhenPending: true,
      });
      useEffect(() => {
        invoke();
      }, [invoke]);
      return <h1>Loaded!</h1>;
    };
    const {queryByText} = render(
      <ErrorBoundary fallbackRender={() => <h1>Error!</h1>}>
        <Component />
      </ErrorBoundary>,
    );
    await waitForExpect(() => {
      expect(queryByText('Error!')).toBeVisible();
      expect(queryByText('Loaded!')).toBeNull();
    });
    // TODO: sort act() warnings
  });
});
