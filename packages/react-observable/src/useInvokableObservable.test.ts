import {renderHook, act} from '@testing-library/react-hooks';
import {
  Observable,
  create,
  fromArray,
  fromError,
} from '@jameslnewell/observable';
import {Status, Factory, useInvokableObservable} from '.';

// waiting, received, completed errored
const waiting = (): Observable<number> => create(() => {});
const received = (x = 1): Observable<number> =>
  create(observer => observer.next(x));
const completed = (): Observable<number> => fromArray([1, 2, 3]);
const errored = (e?: any): Observable<number> => fromError(e);

const delay = <T, E = any>(
  observable: Observable<T, E>,
  ms = 100,
): Observable<T, E> => {
  return create(observer => {
    const subscription = observable.subscribe({
      next: data => setTimeout(() => observer.next(data), ms),
      complete: () => setTimeout(() => observer.complete(), ms),
      error: error => setTimeout(() => observer.error(error), ms),
    });
    return subscription.unsubscribe;
  });
};

function wait<T>(fn: () => Promise<T>, ms = 100): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(async () => {
      try {
        resolve(fn());
      } catch (error) {
        reject(error);
      }
    }, ms),
  );
}

describe('useInvokableObservable()', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function runUseObservableHook<T>(fn: Factory<T> | undefined) {
    return renderHook(() => useInvokableObservable(fn));
  }

  test('is in unknown state when no observable is provided', async () => {
    const {result} = runUseObservableHook(undefined);
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  test('is in unknown state when an observable is provided but not yet invoked', async () => {
    const {result} = runUseObservableHook(() => waiting());
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  test('is in waiting state when an observable is provided, when it has been invoked and is waiting for a value', async () => {
    const {result} = runUseObservableHook(() => waiting());
    act(() => result.current[0]());
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: Status.Waiting,
        error: undefined,
      }),
    ]);
  });

  test('is in received state when an observable is provided, when it has been invoked and a value is observed', async () => {
    const {result} = runUseObservableHook(() => received());
    act(() => result.current[0]());
    expect(result.current).toEqual([
      expect.any(Function),
      1,
      expect.objectContaining({
        status: Status.Receieved,
        error: undefined,
      }),
    ]);
  });

  test('is in completed state when an observable is provided, when it has been invoked and has completed', async () => {
    const {result} = runUseObservableHook(() => completed());
    act(() => result.current[0]());
    expect(result.current).toEqual([
      expect.any(Function),
      3,
      expect.objectContaining({
        status: Status.Completed,
        error: undefined,
      }),
    ]);
  });

  test('is in errored state when an observable is provided, when it has been invoked and has errored', async () => {
    const {result} = runUseObservableHook(() =>
      fromError(new Error('This is a test error!')),
    );
    act(() => result.current[0]());
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: Status.Errored,
        error: new Error('This is a test error!'),
      }),
    ]);
  });

  test('is in waiting state when an observable is provided, when it has been invoked and is waiting and the component is unmounted', async () => {
    const {result, unmount} = runUseObservableHook(() => waiting());
    act(() => result.current[0]());
    unmount();
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: Status.Waiting,
        error: undefined,
      }),
    ]);
  });

  test('is in unknown state when rerendered and no observable is provided', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokableObservable(
          step === 0 ? () => fromArray([{foo: 'bar'}]) : undefined,
          [step],
        ),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  test('is in waiting when rerendered, an observable is provided, when it has been invoked and is waiting for a value', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokableObservable(() => (step === 0 ? received() : waiting()), [
          step,
        ]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    act(() => result.current[0]());
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: Status.Waiting,
        error: undefined,
      }),
    ]);
  });

  test('is in received when rerendered, an observable is provided, when it has been invoked and a value is observed', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokableObservable(() => (step === 0 ? completed() : received()), [
          step,
        ]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    act(() => result.current[0]());
    expect(result.current).toEqual([
      expect.any(Function),
      1,
      expect.objectContaining({
        status: Status.Receieved,
        error: undefined,
      }),
    ]);
  });

  it('should not update state with the result of an old observable when an old observable publishes a value after the current observable', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useInvokableObservable(() => delay(received(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => result.current[0]());
    expect(result.current[2].isWaiting).toBeTruthy();
    rerender({ms: 10});
    act(() => result.current[0]());
    await waitForNextUpdate();
    await wait(async () => {
      expect(result.current).toEqual([
        expect.any(Function),
        10,
        expect.objectContaining({
          status: Status.Receieved,
          error: undefined,
        }),
      ]);
    }, 100);
  });

  it('should not update state with the result of an old observable when an old observable errored after the current observable', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useInvokableObservable(() => delay(errored(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => result.current[0]());
    expect(result.current[2].isWaiting).toBeTruthy();
    rerender({ms: 10});
    act(() => result.current[0]());
    await waitForNextUpdate();
    await wait(async () => {
      expect(result.current).toEqual([
        expect.any(Function),
        undefined,
        expect.objectContaining({
          status: Status.Errored,
          error: 10,
        }),
      ]);
    }, 100);
  });
});
