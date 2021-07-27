import {renderHook, act} from '@testing-library/react-hooks';
import {useInvokableObservable} from './useInvokableObservable';
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
import {delay} from 'rxjs/operators';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function renderUseInvokableObservable(
  factory: () => Observable<unknown> | undefined,
) {
  return renderHook(() => useInvokableObservable(factory));
}

describe('useInvokableObservable()', () => {
  test('is undefined when not invoked', () => {
    const {result} = renderUseInvokableObservable(createWaitingObservable);
    expect(result.current).toEqual(expect.objectContaining(createEmptyState()));
  });
  test('throws an error when invoked and the factory does not return an observable', () => {
    const {result} = renderUseInvokableObservable(() => undefined);
    act(() => {
      expect(() => result.current.invoke()).toThrowError(
        'Factory did not return a promise.',
      );
    });
  });
  test('is loading when waiting', () => {
    const {result} = renderUseInvokableObservable(createWaitingObservable);
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
  });
  test('is loaded when received', () => {
    const {result} = renderUseInvokableObservable(createReceivedObservable);
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('is loaded when completed', () => {
    const {result} = renderUseInvokableObservable(createCompletedObservable);
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('is errored when errored', () => {
    const {result} = renderUseInvokableObservable(createErroredObservable);
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('eventually loads', async () => {
    const {result, waitForValueToChange} = renderUseInvokableObservable(
      createEventuallyCompletedObservable,
    );
    act(() => {
      result.current.invoke();
    });
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('eventually errors', async () => {
    const {result, waitForValueToChange} = renderUseInvokableObservable(
      createEventuallyErroredObservable,
    );
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('subscribed', async () => {
    const {result, waitForValueToChange} = renderUseInvokableObservable(
      createReceivingObservable,
    );
    act(() => {
      result.current.invoke();
    });
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
    const factory1 = (): Observable<string> => of('foo').pipe(delay(500));
    const factory2 = (): Observable<string> => of('bar').pipe(delay(500));
    const {result, rerender, waitForValueToChange} = renderHook(
      ({
        factory,
      }: {
        factory: () => Observable<string> | undefined;
        deps: unknown[];
      }) => useInvokableObservable(factory),
      {initialProps: {factory: factory1, deps: [factory1]}},
    );
    expect(result.current).toEqual(expect.objectContaining(createEmptyState()));
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState('foo')),
    );
    rerender({factory: factory2, deps: [factory2]});
    expect(result.current).toEqual(expect.objectContaining(createEmptyState()));
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState('bar')),
    );
  });
});
