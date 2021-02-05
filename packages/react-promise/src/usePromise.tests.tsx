import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import {renderHook, RenderHookResult} from '@testing-library/react-hooks';
import {render} from '@testing-library/react';
import {ErrorBoundary} from 'react-error-boundary';
import {usePromise, UsePromiseOptions, UsePromiseResult} from './usePromise';
import {
  value,
  error,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  noop,
} from './__fixtures__';
import {Factory, Status} from './createResource';

function renderUseDeferredPromiseHook<Value = unknown, Error = unknown>(
  fn: Factory<never, Value> | undefined,
  opts?: UsePromiseOptions,
): RenderHookResult<unknown, UsePromiseResult<Value, Error>> {
  return renderHook(() => usePromise(fn, opts));
}

describe('usePromise()', () => {
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
    const {result} = renderUseDeferredPromiseHook(createPendingPromise);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        value: undefined,
        error: undefined,
      }),
    );
  });

  test('state transitions to fulfilled when mounted', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      createFulfilledPromise,
    );
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Fulfilled,
        value,
        error: undefined,
      }),
    );
  });

  test('state transitions to rejected when mounted', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(
      createRejectedPromise,
    );
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Rejected,
        value: undefined,
        error,
      }),
    );
  });

  test('suspends when pending and suspendWhenPending=true', () => {
    const Component: React.FC = () => {
      usePromise(createPendingPromise, {suspendWhenPending: true});
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
      usePromise(createPendingPromise, {suspendWhenPending: true});
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
