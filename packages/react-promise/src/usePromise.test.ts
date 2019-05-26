import {renderHook} from 'react-hooks-testing-library';
import {Status, Factory, usePromise} from '.';

describe('usePromise()', () => {
  // https://github.com/mpeyper/react-hooks-testing-library/issues/76
  let globalUnmount: (() => void) | undefined;
  afterEach(() => {
    if (globalUnmount) {
      globalUnmount();
      globalUnmount;
    }
  });

  function runHook<P, R>(callback: (props: P) => R) {
    const ret = renderHook(callback);
    globalUnmount = ret.unmount;
    return ret;
  }

  function runUsePromiseHook<T>(fn: Factory<T>) {
    return runHook(() => usePromise(fn));
  }

  it('should be unknown when no promise is returned', async () => {
    const {result} = runUsePromiseHook(() => undefined);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        error: undefined,
        data: undefined,
      }),
    );
  });

  it('should be resolving when a promise is returned and is resolving', async () => {
    const {result} = runUsePromiseHook(() => Promise.resolve({foo: 'bar'}));
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
        data: undefined,
      }),
    );
  });

  it('should be resolved when a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate} = runUsePromiseHook(() =>
      Promise.resolve({foo: 'bar'}),
    );
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Fulfilled,
        error: undefined,
        data: {bar: 'foo'},
      }),
    );
  });

  it('should be rejected when a promise is returned and is rejected', async () => {
    const {result, waitForNextUpdate} = runUsePromiseHook(() =>
      Promise.reject(new Error('This is a test error!')),
    );
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Rejected,
        error: new Error('This is a test error!'),
        data: undefined,
      }),
    );
  });

  it('should remain resolving when a promise is return and is resolving and the component is unmounted', async () => {
    const {result, unmount} = runUsePromiseHook(() =>
      Promise.resolve({foo: 'bar'}),
    );
    unmount();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
        data: undefined,
      }),
    );
  });

  it('should be unknown when rerendered and no promise is returned', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        usePromise(
          () => (step === 0 ? Promise.resolve({foo: 'bar'}) : undefined),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    await waitForNextUpdate();
    rerender({step: 1});
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        error: undefined,
        data: undefined,
      }),
    );
  });

  it('should be resolving when rerendered and a promise is returned and is resolving', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        usePromise(
          () => Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'}),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    await waitForNextUpdate();
    rerender({step: 1});
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
        data: undefined,
      }),
    );
  });

  it('should be resolved when rerendered and a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        usePromise(
          () => Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'}),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    await waitForNextUpdate();
    rerender({step: 1});
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: Status.Fulfilled,
        error: undefined,
        data: {bar: 'foo'},
      }),
    );
  });
});
