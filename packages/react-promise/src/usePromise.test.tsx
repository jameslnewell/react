import {renderHook} from 'react-hooks-testing-library';
import usePromise, {Status, Factory} from './usePromise';

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

  it('should be unknown when no promise is provided', async () => {
    const {result} = runUsePromiseHook(() => undefined);
    expect(result.current).toEqual([undefined, undefined, undefined]);
  });

  it('should be resolving when the promise is resolving', async () => {
    const {result} = runUsePromiseHook(() => Promise.resolve({foo: 'bar'}));
    expect(result.current).toEqual([Status.Resolving, undefined, undefined]);
  });

  it('should be resolved when the promise is resolved', async () => {
    const {result, waitForNextUpdate} = runUsePromiseHook(() =>
      Promise.resolve({foo: 'bar'}),
    );
    await waitForNextUpdate();
    expect(result.current).toEqual([Status.Resolved, undefined, {foo: 'bar'}]);
  });

  it('should be rejected when the promise is rejected', async () => {
    const {result, waitForNextUpdate} = runUsePromiseHook(() =>
      Promise.reject(new Error('This is a test error!')),
    );
    await waitForNextUpdate();
    expect(result.current).toEqual([
      Status.Rejected,
      new Error('This is a test error!'),
      undefined,
    ]);
  });

  it('should not update when the hook is unmounted', async () => {
    const {result, unmount} = runUsePromiseHook(() =>
      Promise.resolve({foo: 'bar'}),
    );
    unmount();
    expect(result.current).toEqual([Status.Resolving, undefined, undefined]);
  });

  it('should be unknown when rerendered and no promise is provided', async () => {
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
    expect(result.current).toEqual([undefined, undefined, undefined]);
  });

  it('should be resolving when rerendered with a new promise', async () => {
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
    expect(result.current).toEqual([Status.Resolving, undefined, undefined]);
  });

  it('should be resolved when rerendered with a new promise', async () => {
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
    expect(result.current).toEqual([Status.Resolved, undefined, {bar: 'foo'}]);
  });
});
