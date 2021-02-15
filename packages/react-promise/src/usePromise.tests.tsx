import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import {renderHook, RenderHookResult} from '@testing-library/react-hooks';
import {render} from '@testing-library/react';
import {ErrorBoundary} from 'react-error-boundary';
import {usePromise, UsePromiseOptions, UsePromiseResult} from './usePromise';
import {
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  noop,
  unknownState,
  rejectedState,
  fulfilledState,
  pendingState,
} from './__fixtures__';
import {Factory} from './types';
import {waitForExpect} from 'testing-utilities';

function renderUseDeferredPromiseHook<
  Parameters extends unknown[],
  Value = unknown
>(
  factory: Factory<never, Value> | undefined,
  options?: UsePromiseOptions,
): RenderHookResult<unknown, UsePromiseResult<Parameters, Value>> {
  return renderHook(() => usePromise(factory, options));
}

describe('usePromise()', () => {
  test('state is unknown when mounted without a fn', () => {
    const {result} = renderUseDeferredPromiseHook(undefined);
    expect(result.current).toEqual(expect.objectContaining(unknownState));
  });

  test('state is pending when mounted with a fn', () => {
    const {result} = renderUseDeferredPromiseHook(createPendingPromise);
    expect(result.current).toEqual(expect.objectContaining(pendingState));
  });

  test('state transitions to fulfilled when mounted', async () => {
    const {result} = renderUseDeferredPromiseHook(createFulfilledPromise);
    await waitForExpect(() => {
      expect(result.current).toEqual(expect.objectContaining(fulfilledState));
    });
  });

  test('state transitions to rejected when mounted', async () => {
    const {result} = renderUseDeferredPromiseHook(createRejectedPromise);
    await waitForExpect(() => {
      expect(result.current).toEqual(expect.objectContaining(rejectedState));
    });
  });

  test('suspends when pending and suspendWhenPending=true', async () => {
    const Component: React.FC = () => {
      usePromise(createPendingPromise, {suspendWhenPending: true});
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
    jest.spyOn(console, 'error').mockImplementation(noop);
    const Component: React.FC = () => {
      const result = usePromise(createRejectedPromise, {
        throwWhenRejected: true,
      });
      console.log(result);
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
  });
});
