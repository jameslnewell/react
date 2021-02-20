import '@testing-library/jest-dom/extend-expect';
import React, {useEffect} from 'react';
import {act, renderHook, RenderHookResult} from '@testing-library/react-hooks';
import {render} from '@testing-library/react';
import {ErrorBoundary} from 'react-error-boundary';
import {
  useDeferredObservable,
  UseDeferredObservableOptions,
  UseDeferredObservableResult,
} from './useDeferredObservable';
import {
  value,
  error,
  createCompletedObservable,
  createWaitingObservable,
  createErroredObservable,
  noop,
  unknownState,
  completedState,
  waitingState,
  erroredState,
} from './__fixtures__';
import {Factory} from './types';
import {waitForExpect} from 'testing-utilities';
import {delay, fromArray} from '@jameslnewell/observable';
import {cache} from './cache';

function renderUseDeferredPromiseHook<
  Parameters extends unknown[] = [],
  Value = unknown
>(
  keys: unknown[],
  factory: Factory<Parameters, Value>,
  options?: UseDeferredObservableOptions,
): RenderHookResult<unknown, UseDeferredObservableResult<Parameters, Value>> {
  return renderHook(() => useDeferredObservable(keys, factory, options));
}

// TODO: add tests for keys/hashes

describe('useDeferredObservable()', () => {
  beforeEach(() => {
    cache.clear();
  });

  test('state is undefined when mounted', () => {
    const {result} = renderUseDeferredPromiseHook([], createWaitingObservable);
    expect(result.current).toEqual(expect.objectContaining(unknownState));
  });

  test('state is pending when invoked', () => {
    const {result} = renderUseDeferredPromiseHook([], createWaitingObservable);
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(expect.objectContaining(waitingState));
  });

  test('state transitions to fulfilled when invoked', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      [],
      createCompletedObservable,
    );
    act(() => {
      result.current.invoke();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining(completedState));
  });

  test('state transitions to rejected when invoked', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      [],
      createErroredObservable,
    );
    act(() => {
      result.current.invoke();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining(erroredState));
  });

  test('returns a value when invoked and fulfilled', async () => {
    const {result} = renderUseDeferredPromiseHook(
      [],
      createCompletedObservable,
    );
    await act(async () => {
      await expect(result.current.invoke()).resolves.toEqual(value);
    });
  });

  test('throws an error when invoked and rejected', async () => {
    const {result} = renderUseDeferredPromiseHook([], createErroredObservable);
    await act(async () => {
      await expect(result.current.invoke()).rejects.toEqual(error);
    });
  });

  test('uses result from last invoked promise even when the previously invoked promise finishes last', async () => {
    const fn = jest
      .fn()
      .mockImplementationOnce(() => delay(100)(fromArray([1])))
      .mockImplementationOnce(() => delay(50)(fromArray([2])));
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
      .mockImplementationOnce(() => delay(100)(fromArray([3])))
      .mockImplementationOnce(() => delay(50)(fromArray([4])));
    const {result, waitFor} = renderUseDeferredPromiseHook([], fn);
    act(() => {
      result.current.invoke();
      result.current.invoke();
    });
    await waitFor(() =>
      expect(result.current).toEqual(expect.objectContaining({error: 4})),
    );
  });

  test('suspends when pending and suspendWhenPending=true', async () => {
    const Component: React.FC = () => {
      const {invoke} = useDeferredObservable([], createWaitingObservable, {
        suspendWhenWaiting: true,
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
      const {invoke} = useDeferredObservable([], createWaitingObservable, {
        suspendWhenWaiting: true,
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
