import {renderHook} from '@testing-library/react-hooks';
import {Status, Factory, useObservable} from '.';
import {
  Observable,
  create,
  fromArray,
  fromError,
} from '@jameslnewell/observable';

// waiting, received, completed errored
const waiting = (): Observable<number> => create(() => {});
const received = (): Observable<number> => create(observer => observer.next(1));
const completed = (): Observable<number> => fromArray([1, 2, 3]);

describe('useObservable()', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function runUseObservableHook<T>(fn: Factory<T> | undefined) {
    return renderHook(() => useObservable(fn));
  }

  test('is in unknown state when no observable is provided', async () => {
    const {result} = runUseObservableHook(undefined);
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  test('is in waiting state when an observable is provided and is waiting for a value', async () => {
    const {result} = runUseObservableHook(() => waiting());
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: Status.Waiting,
        error: undefined,
      }),
    ]);
  });

  test('is in received state when an observable is provided and a value is observed', async () => {
    const {result} = runUseObservableHook(() => received());
    expect(result.current).toEqual([
      1,
      expect.objectContaining({
        status: Status.Receieved,
        error: undefined,
      }),
    ]);
  });

  test('is in completed state when an observable is provided and has completed', async () => {
    const {result} = runUseObservableHook(() => completed());
    expect(result.current).toEqual([
      3,
      expect.objectContaining({
        status: Status.Completed,
        error: undefined,
      }),
    ]);
  });

  test('is in errored state when an observable is provided and has errored', async () => {
    const {result} = runUseObservableHook(() =>
      fromError(new Error('This is a test error!')),
    );
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: Status.Errored,
        error: new Error('This is a test error!'),
      }),
    ]);
  });

  test('is in waiting state when an observable is provided, is waiting and the component is unmounted', async () => {
    const {result, unmount} = runUseObservableHook(() => waiting());
    unmount();
    expect(result.current).toEqual([
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
        status: Status.Waiting,
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
        status: Status.Receieved,
        error: undefined,
      }),
    ]);
  });
});
