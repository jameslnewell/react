import {renderHook} from '@testing-library/react-hooks';
import {UseObservableStatus, UseObservableFactory, useObservable} from '.';
import {
  Observable,
  create,
  fromArray,
  fromError,
} from '@jameslnewell/observable';

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

describe('useObservable()', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function renderUseObservableHook<T>(fn: UseObservableFactory<T> | undefined) {
    return renderHook(() => useObservable(fn));
  }

  test('is in unknown state when no observable is provided', async () => {
    const {result} = renderUseObservableHook(undefined);
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  test('is in waiting state when an observable is provided and is waiting for a value', async () => {
    const {result} = renderUseObservableHook(() => waiting());
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: UseObservableStatus.Waiting,
        error: undefined,
      }),
    ]);
  });

  test('is in received state when an observable is provided and a value is observed', async () => {
    const {result} = renderUseObservableHook(() => received());
    expect(result.current).toEqual([
      1,
      expect.objectContaining({
        status: UseObservableStatus.Receieved,
        error: undefined,
      }),
    ]);
  });

  test('is in completed state when an observable is provided and has completed', async () => {
    const {result} = renderUseObservableHook(() => completed());
    expect(result.current).toEqual([
      3,
      expect.objectContaining({
        status: UseObservableStatus.Completed,
        error: undefined,
      }),
    ]);
  });

  test('is in errored state when an observable is provided and has errored', async () => {
    const {result} = renderUseObservableHook(() =>
      fromError(new Error('This is a test error!')),
    );
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: UseObservableStatus.Errored,
        error: new Error('This is a test error!'),
      }),
    ]);
  });

  test('is in waiting state when an observable is provided, is waiting and the component is unmounted', async () => {
    const {result, unmount} = renderUseObservableHook(() => waiting());
    unmount();
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: UseObservableStatus.Waiting,
        error: undefined,
      }),
    ]);
  });

  test('is in unknown state when rerendered and no observable is provided', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useObservable(
          step === 0 ? () => fromArray([{foo: 'bar'}]) : undefined,
          [step],
        ),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  test('is in waiting when rerendered, an observable is provided and is waiting for a value', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useObservable(() => (step === 0 ? received() : waiting()), [step]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: UseObservableStatus.Waiting,
        error: undefined,
      }),
    ]);
  });

  test('is in received when rerendered, an observable is provided and a value is observed', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useObservable(() => (step === 0 ? completed() : received()), [step]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    expect(result.current).toEqual([
      1,
      expect.objectContaining({
        status: UseObservableStatus.Receieved,
        error: undefined,
      }),
    ]);
  });

  it('should not update state with the result of an old observable when an old observable publishes after the current observable', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useObservable(() => delay(received(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    expect(result.current[1].isWaiting).toBeTruthy();
    rerender({ms: 10});
    await waitForNextUpdate();
    await wait(async () => {
      expect(result.current).toEqual([
        10,
        expect.objectContaining({
          status: UseObservableStatus.Receieved,
          error: undefined,
        }),
      ]);
    }, 100);
  });

  it('should not update state with the result of an old observable when an old observable errored after the current observable', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) => useObservable(() => delay(errored(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    expect(result.current[1].isWaiting).toBeTruthy();
    rerender({ms: 10});
    await waitForNextUpdate();
    await wait(async () => {
      expect(result.current).toEqual([
        undefined,
        expect.objectContaining({
          status: UseObservableStatus.Errored,
          error: 10,
        }),
      ]);
    }, 100);
  });
});
