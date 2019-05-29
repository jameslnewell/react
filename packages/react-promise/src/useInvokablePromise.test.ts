import {renderHook} from 'react-hooks-testing-library';
import {useInvokablePromise} from '.';
import {Factory, Status} from './types';

describe('useInvokablePromise()', () => {
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-explicit-any
  function runUseInvokablePromiseHook<T, P extends any[] = []>(
    fn: Factory<T, P>,
  ) {
    return runHook(() => useInvokablePromise(fn));
  }

  function delay<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) =>
      setTimeout(async () => {
        try {
          resolve(await promise);
        } catch (error) {
          reject(error);
        }
      }, 100),
    );
  }

  it('should be unknown when a promise is not returned', async () => {
    const {result} = runUseInvokablePromiseHook(() => undefined);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be unknown when a promise is not invoked', async () => {
    const {result} = runUseInvokablePromiseHook(() =>
      delay(Promise.resolve({foo: 'bar'})),
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be resolving when a promise is returned and is resolving', async () => {
    const {result} = runUseInvokablePromiseHook(() =>
      delay(Promise.resolve({foo: 'bar'})),
    );
    result.current.invoke();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be resolved when a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate} = runUseInvokablePromiseHook(() =>
      delay(Promise.resolve({foo: 'bar'})),
    );
    result.current.invoke();
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Fulfilled,
        error: undefined,
        value: {foo: 'bar'},
      }),
    );
  });

  it('should be rejected when a promise is returned and is rejected', async () => {
    const {result, waitForNextUpdate} = runUseInvokablePromiseHook(() =>
      delay(Promise.reject(new Error('This is a test error!'))),
    );
    result.current.invoke();
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Rejected,
        error: new Error('This is a test error!'),
        value: undefined,
      }),
    );
  });

  it('should remain resolving when a promise is return and is resolving and the component is unmounted', async () => {
    const {result, unmount} = runUseInvokablePromiseHook(() =>
      delay(Promise.resolve({foo: 'bar'})),
    );
    result.current.invoke();
    unmount();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be unknown when rerendered and no promise is returned', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokablePromise(
          () => (step === 0 ? delay(Promise.resolve({foo: 'bar'})) : undefined),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    result.current.invoke();
    await waitForNextUpdate();
    rerender({step: 1});
    result.current.invoke();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be resolving when rerendered and a promise is returned and is resolving', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokablePromise(
          () =>
            delay(Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'})),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    result.current.invoke();
    await waitForNextUpdate();
    rerender({step: 1});
    result.current.invoke();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
        value: undefined,
      }),
    );
  });

  it('should be resolved when rerendered and a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokablePromise(
          () =>
            delay(Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'})),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    result.current.invoke();
    await waitForNextUpdate();
    rerender({step: 1});
    result.current.invoke();
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Fulfilled,
        error: undefined,
        value: {bar: 'foo'},
      }),
    );
  });
});
