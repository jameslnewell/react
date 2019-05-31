import {renderHook} from 'react-hooks-testing-library';
import {Status, Factory, useObservable} from '.';
import {of, throwError, Observable} from 'rxjs';

// waiting, received, completed errored
const waiting = (): Observable<number> => Observable.create(() => {});
const received = (): Observable<number> =>
  Observable.create(subject => subject.next(1));
const completed = (): Observable<number> => of(1, 2, 3);

describe('useObservable()', () => {
  // https://github.com/mpeyper/react-hooks-testing-library/issues/76
  let globalUnmount: (() => void) | undefined;
  afterEach(() => {
    if (globalUnmount) {
      globalUnmount();
      globalUnmount;
    }
  });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function runHook<P, R>(callback: (props: P) => R) {
    const ret = renderHook(callback);
    globalUnmount = ret.unmount;
    return ret;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function runUseObservableHook<T>(fn: Factory<T>) {
    return runHook(() => useObservable(fn));
  }

  it('should be unknown when no observable is returned', async () => {
    const {result} = runUseObservableHook(() => undefined);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be waiting when an observable is returned and is waiting for a value', async () => {
    const {result} = runUseObservableHook(() => waiting());
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Waiting,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be received when an observable is returned and a value is observed', async () => {
    const {result} = runUseObservableHook(() => received());
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Receieved,
        error: undefined,
        value: 1,
      }),
    );
  });

  it('should be completed when an observable is returned and has completed', async () => {
    const {result} = runUseObservableHook(() => completed());
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Completed,
        error: undefined,
        value: 3,
      }),
    );
  });

  it('should be errored when an observable is returned and has errored', async () => {
    const {result} = runUseObservableHook(() =>
      throwError(new Error('This is a test error!')),
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Errored,
        error: new Error('This is a test error!'),
        value: undefined,
      }),
    );
  });

  it('should be waiting when an observable is returned, is waiting and the component is unmounted', async () => {
    const {result, unmount} = runUseObservableHook(() => waiting());
    unmount();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Waiting,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be unknown when rerendered and no observable is returned', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useObservable(() => (step === 0 ? of({foo: 'bar'}) : undefined), [
          step,
        ]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be waiting when rerendered, an observable is returned and is waiting for a value', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useObservable(() => (step === 0 ? received() : waiting()), [step]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Waiting,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be received when rerendered, an observable is returned and a value is observed', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useObservable(() => (step === 0 ? completed() : received()), [step]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Receieved,
        error: undefined,
        value: 1,
      }),
    );
  });
});
