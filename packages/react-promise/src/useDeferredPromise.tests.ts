import {act, renderHook, RenderHookResult} from '@testing-library/react-hooks';
import {
  UseDeferredPromiseStatus,
  UseDeferredPromiseFactoryFunction,
  useDeferredPromise,
  UseDeferredPromiseResult,
} from './useDeferredPromise';

describe('useDeferredPromise()', () => {
  function renderUseDeferredPromiseHook<
    Value,
    Parameters extends unknown[] = []
  >(
    fn: UseDeferredPromiseFactoryFunction<Value, Parameters> | undefined,
  ): RenderHookResult<unknown, UseDeferredPromiseResult<Value, Parameters>> {
    return renderHook(() => useDeferredPromise(fn, []));
  }

  function delay<T>(fn: () => Promise<T>, ms = 100): Promise<T> {
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

  it('should be unknown when a promise is not returned', async () => {
    const {result} = renderUseDeferredPromiseHook(undefined);
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        value: undefined,
        error: undefined,
      }),
    );
  });

  it('should be unknown when a promise is not invoked', async () => {
    const {result} = renderUseDeferredPromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        value: undefined,
        error: undefined,
      }),
    );
  });

  it('should be resolving when a promise is returned and is resolving', async () => {
    const {result} = renderUseDeferredPromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        status: UseDeferredPromiseStatus.Pending,
        value: undefined,
        error: undefined,
      }),
    );
  });

  it('should be resolved when a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: UseDeferredPromiseStatus.Fulfilled,
        value: {foo: 'bar'},
        error: undefined,
      }),
    );
  });

  it('should be rejected when a promise is returned and is rejected', async () => {
    const {result, waitForNextUpdate} = renderUseDeferredPromiseHook(() =>
      delay(() => Promise.reject(new Error('This is a test error!'))),
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: UseDeferredPromiseStatus.Rejected,
        value: undefined,
        error: new Error('This is a test error!'),
      }),
    );
  });

  it('should remain resolving when a promise is return and is resolving and the component is unmounted', async () => {
    const {result, unmount} = renderUseDeferredPromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    unmount();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: UseDeferredPromiseStatus.Pending,
        value: undefined,
        error: undefined,
      }),
    );
  });

  it('should be unknown when rerendered and no promise is returned', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useDeferredPromise(
          step === 0
            ? () => delay(() => Promise.resolve({foo: 'bar'}))
            : undefined,
          [step],
        ),
      {initialProps: {step: 0}},
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    await waitForNextUpdate();
    rerender({step: 1});
    await act(async () => {
      // run async and don't wait
      await expect(result.current.invokeAsync()).rejects.toThrow(
        /The invoke function cannot be called at this time because the factory didn't return a promise./,
      );
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        status: undefined,
        value: undefined,
        error: undefined,
      }),
    );
  });

  it('should be resolving when rerendered and a promise is returned and is resolving', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useDeferredPromise(
          () =>
            delay(() =>
              Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'}),
            ),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    await waitForNextUpdate();
    rerender({step: 1});
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining({
        status: UseDeferredPromiseStatus.Pending,
        value: undefined,
        error: undefined,
      }),
    );
  });

  it('should be resolved when rerendered and a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useDeferredPromise(
          () =>
            delay(() =>
              Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'}),
            ),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    await waitForNextUpdate();
    rerender({step: 1});
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        status: UseDeferredPromiseStatus.Fulfilled,
        value: {bar: 'foo'},
        error: undefined,
      }),
    );
  });

  it('should not update state with the result of an old promise when an old promise resolves after the current promise', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useDeferredPromise(() => delay(() => Promise.resolve(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    expect(result.current.isPending).toBeTruthy();
    rerender({ms: 10});
    act(() => {
      result.current.invoke();
    });
    await waitForNextUpdate();
    await delay(async () => {
      expect(result.current).toEqual(
        expect.objectContaining({
          status: UseDeferredPromiseStatus.Fulfilled,
          value: 10,
          error: undefined,
        }),
      );
    }, 100);
  });

  it('should not update state with the result of an old promise when an old promise rejects after the current promise', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useDeferredPromise(() => delay(() => Promise.reject(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => {
      // run async and don't wait
      result.current.invoke();
    });
    expect(result.current.isPending).toBeTruthy();
    rerender({ms: 10});
    act(() => {
      result.current.invoke();
    });
    await waitForNextUpdate();
    await delay(async () => {
      expect(result.current).toEqual(
        expect.objectContaining({
          status: UseDeferredPromiseStatus.Rejected,
          value: undefined,
          error: 10,
        }),
      );
    }, 100);
  });

  it('should return the value from the invoke function', async () => {
    expect.assertions(1);
    const {result} = renderUseDeferredPromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    await act(async () => {
      const value = await result.current.invokeAsync();
      expect(value).toEqual({foo: 'bar'});
    });
  });

  it('should throw an error from the invoke function', async () => {
    expect.assertions(1);
    const {result} = renderUseDeferredPromiseHook(undefined);
    await act(async () => {
      await expect(result.current.invokeAsync()).rejects.toThrowError();
    });
  });
});
