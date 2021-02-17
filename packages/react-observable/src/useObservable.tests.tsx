import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import {renderHook, RenderHookResult} from '@testing-library/react-hooks';
import {render} from '@testing-library/react';
import {ErrorBoundary} from 'react-error-boundary';
import {
  useObservable,
  UseObservableOptions,
  UseObservableResult,
} from './useObservable';
import {
  createCompletedObservable,
  createWaitingObservable,
  createErroredObservable,
  noop,
  erroredState,
  completedState,
  waitingState,
} from './__fixtures__';
import {Factory} from './types';
import {waitForExpect} from 'testing-utilities';

function renderUseDeferredPromiseHook<Value = unknown>(
  keys: unknown[],
  factory: Factory<never, Value>,
  options?: UseObservableOptions,
): RenderHookResult<unknown, UseObservableResult<Value>> {
  return renderHook(() => useObservable(keys, factory, options));
}

describe('usePromise()', () => {
  test('state is pending when mounted with a fn', () => {
    const {result} = renderUseDeferredPromiseHook([], createWaitingObservable);
    expect(result.current).toEqual(expect.objectContaining(waitingState));
  });

  test('state transitions to fulfilled when mounted', async () => {
    const {result} = renderUseDeferredPromiseHook(
      [],
      createCompletedObservable,
    );
    await waitForExpect(() => {
      expect(result.current).toEqual(expect.objectContaining(completedState));
    });
  });

  test('state transitions to rejected when mounted', async () => {
    const {result} = renderUseDeferredPromiseHook([], createErroredObservable);
    await waitForExpect(() => {
      expect(result.current).toEqual(expect.objectContaining(erroredState));
    });
  });

  test('suspends when pending and suspendWhenPending=true', async () => {
    const Component: React.FC = () => {
      useObservable([], createWaitingObservable, {suspendWhenWaiting: true});
      return <h1>Loaded!</h1>;
    };
    const {queryByText} = render(
      <React.Suspense fallback={<p>Loading...</p>}>
        <Component />
      </React.Suspense>,
    );
    await waitForExpect(() => {
      expect(queryByText('Loading...')).toBeVisible();
      expect(queryByText('Loaded!')).toBeNull();
    });
  });

  test('throws when rejected and throwWhenRejected=true', async () => {
    const symbol = Symbol();
    jest.spyOn(console, 'error').mockImplementation(noop);
    const Component: React.FC = () => {
      useObservable([symbol], createErroredObservable, {
        throwWhenErrored: true,
      });
      return <h1>Loaded!</h1>;
    };
    const {queryByText} = render(
      <ErrorBoundary fallback={<h1>Error!</h1>}>
        <Component />
      </ErrorBoundary>,
    );
    await waitForExpect(() => {
      expect(queryByText('Error!')).toBeVisible();
      expect(queryByText('Loaded!')).toBeNull();
    });
  });
});
