import {renderHook} from '@testing-library/react-hooks';
import {useObservable} from './useObservable';
import {
  createCompletedObservable,
  createErroredObservable,
  createEventuallyCompletedObservable,
  createEventuallyErroredObservable,
  createReceivedObservable,
  createReceivingObservable,
  createWaitingObservable,
  error,
  value,
} from './__fixtures__';
import {Observable, of} from 'rxjs';
import {
  createEmptyState,
  createErroredState,
  createLoadedState,
  createLoadingState,
} from './state';
import {Status} from './status';
import {delay} from 'rxjs/operators';

function renderUseObservable(
  observable: Observable<unknown> | undefined,
): ReturnType<typeof renderHook> {
  return renderHook(() => useObservable(observable));
}

describe('useObservable()', () => {
  test('is empty when an observable is not passed', () => {
    const {result} = renderUseObservable(undefined);
    expect(result.current).toEqual(expect.objectContaining(createEmptyState()));
  });
  test('is loading when waiting', () => {
    const {result} = renderUseObservable(createWaitingObservable());
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
  });
  test('is loaded when received', () => {
    const {result} = renderUseObservable(createReceivedObservable());
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('is loaded when completed', () => {
    const {result} = renderUseObservable(createCompletedObservable());
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('is errored when errored', () => {
    const {result} = renderUseObservable(createErroredObservable());
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('eventually loads', async () => {
    const {result, waitForValueToChange} = renderUseObservable(
      createEventuallyCompletedObservable(),
    );
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('eventually errors', async () => {
    const {result, waitForValueToChange} = renderUseObservable(
      createEventuallyErroredObservable(),
    );
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('subscribed', async () => {
    const {result, waitForValueToChange} = renderUseObservable(
      createReceivingObservable(),
    );
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(0)),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(1)),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(2)),
    );
  });
  test('rendered with a new observable', async () => {
    const observable1 = of('foo').pipe(delay(500));
    const observable2 = of('bar').pipe(delay(500));
    const {result, rerender, waitForValueToChange} = renderHook(
      ({observable}: {observable: Observable<string>}) =>
        useObservable(observable),
      {initialProps: {observable: observable1}},
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
    rerender({observable: observable2});
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
