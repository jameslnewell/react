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
} from './__fixtures__';
import {Factory, Status} from './types';
import {waitForExpect} from 'testing-utilities';
import {delay} from '@jameslnewell/observable';
import {fromArray} from '@jameslnewell/observable';
import {fromError} from '@jameslnewell/observable';

function renderUseDeferredObservableHook<
  Parameters extends unknown[] = [],
  Value = unknown
>(
  factory: Factory<Parameters, Value> | undefined,
  options?: UseDeferredObservableOptions,
): RenderHookResult<unknown, UseDeferredObservableResult<Parameters, Value>> {
  return renderHook(() => useDeferredObservable(factory, options));
}

describe('useDeferredObservable()', () => {
  test('state is undefined when mounted', () => {
    const {result} = renderUseDeferredObservableHook(createWaitingObservable);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        value: undefined,
        error: undefined,
      }),
    );
  });

  test('throws an error when invoked without a fn', () => {
    const {result} = renderUseDeferredObservableHook(undefined);
    act(() => {
      expect(() => result.current.invokeAsync()).toThrow(
        `No factory provided.`,
      );
    });
  });

  test('state is waiting when invoked', () => {
    const {result} = renderUseDeferredObservableHook(createWaitingObservable);
    act(() => {
      result.current.invokeAsync();
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Waiting,
        value: undefined,
        error: undefined,
      }),
    );
  });

  test('state transitions to completed when invoked', async () => {
    const {result} = renderUseDeferredObservableHook(createCompletedObservable);
    act(() => {
      result.current.invokeAsync();
    });
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

  test('state transitions to errored when invoked', async () => {
    const {result} = renderUseDeferredObservableHook(createErroredObservable);
    act(() => {
      result.current.invokeAsync();
    });
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

  test.todo('returns an observable when invoked');

  test('uses result from last invoked promise even when the previously invoked promise finishes last', async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockImplementationOnce(() => delay(100)(fromArray([1])))
      .mockImplementationOnce(() => delay(50)(fromArray([2])));
    const {result} = renderUseDeferredObservableHook(fn);
    act(() => {
      result.current.invoke();
      result.current.invoke();
      jest.runAllTimers();
    });
    await waitForExpect(() =>
      expect(result.current).toEqual(expect.objectContaining({value: 2})),
    );
  });

  test('uses error from last invoked promise even when the previously invoked promise finishes last', async () => {
    jest.useFakeTimers();
    const fn = jest
      .fn()
      .mockImplementationOnce(() => delay(100)(fromError(3)))
      .mockImplementationOnce(() => delay(50)(fromError(4)));
    const {result, waitFor} = renderUseDeferredObservableHook(fn);
    act(() => {
      result.current.invoke();
      result.current.invoke();
      jest.runAllTimers();
    });
    await waitFor(() =>
      expect(result.current).toEqual(expect.objectContaining({error: 4})),
    );
  });

  test('suspends when waiting and suspendWhenWaiting=true', () => {
    const Component: React.FC = () => {
      const {invoke} = useDeferredObservable(createWaitingObservable, {
        suspendWhenWaiting: true,
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

  test('throws when errored and throwWhenErrored=true', () => {
    jest.spyOn(console, 'error').mockImplementation(noop);
    const Component: React.FC = () => {
      const {invoke} = useDeferredObservable(createErroredObservable, {
        throwWhenErrored: true,
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
