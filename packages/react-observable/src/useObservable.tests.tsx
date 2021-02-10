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
  value,
  error,
  createWaitingObservable,
  createReceivedObservable,
  createCompletedObservable,
  createErroredObservable,
  noop,
} from './__fixtures__';
import {Factory, Status} from './types';
import {waitForExpect} from 'testing-utilities';

function renderUseDeferredPromiseHook<Value = unknown>(
  factory: Factory<never, Value> | undefined,
  options?: UseObservableOptions,
): RenderHookResult<unknown, UseObservableResult<Value>> {
  return renderHook(() => useObservable(factory, options));
}

describe('useObservable()', () => {
  test('state is unknown when mounted without a fn', () => {
    const {result} = renderUseDeferredPromiseHook(undefined);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        value: undefined,
        error: undefined,
      }),
    );
  });

  test('state is pending when mounted with a fn', () => {
    const {result} = renderUseDeferredPromiseHook(createWaitingObservable);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Waiting,
        value: undefined,
        error: undefined,
      }),
    );
  });

  test('state transitions to fulfilled when mounted', async () => {
    const {result} = renderUseDeferredPromiseHook(createCompletedObservable);
    await waitForExpect(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          status: Status.Completed,
          value,
          error: undefined,
        }),
      );
    });
  });

  test('state transitions to rejected when mounted', async () => {
    const {result} = renderUseDeferredPromiseHook(createErroredObservable);
    await waitForExpect(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          status: Status.Errored,
          value: undefined,
          error,
        }),
      );
    });
  });

  test('suspends when pending and suspendWhenWaiting=true', () => {
    const Component: React.FC = () => {
      useObservable(createWaitingObservable, {suspendWhenWaiting: true});
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

  test('throws when rejected and throwWhenErrored=true', () => {
    jest.spyOn(console, 'error').mockImplementation(noop);
    const Component: React.FC = () => {
      useObservable(createErroredObservable, {throwWhenErrored: true});
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
