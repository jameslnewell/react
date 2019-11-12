import {act, renderHook} from '@testing-library/react-hooks';
import {
  UseInvokablePromiseStatus,
  UseInvokablePromiseFactory,
  useInvokablePromise,
} from '.';

describe('useInvokablePromise()', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-explicit-any
  function renderUseInvokablePromiseHook<T, P extends any[] = []>(
    fn: UseInvokablePromiseFactory<T, P> | undefined,
  ) {
    return renderHook(() => useInvokablePromise(fn, []));
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
    const {result} = renderUseInvokablePromiseHook(undefined);
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  it('should be unknown when a promise is not invoked', async () => {
    const {result} = renderUseInvokablePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  it('should be resolving when a promise is returned and is resolving', async () => {
    const {result} = renderUseInvokablePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: UseInvokablePromiseStatus.Pending,
        error: undefined,
      }),
    ]);
  });

  it('should be resolved when a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate} = renderUseInvokablePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual([
      expect.any(Function),
      {foo: 'bar'},
      expect.objectContaining({
        status: UseInvokablePromiseStatus.Fulfilled,
        error: undefined,
      }),
    ]);
  });

  it('should be rejected when a promise is returned and is rejected', async () => {
    const {result, waitForNextUpdate} = renderUseInvokablePromiseHook(() =>
      delay(() => Promise.reject(new Error('This is a test error!'))),
    );
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: UseInvokablePromiseStatus.Rejected,
        error: new Error('This is a test error!'),
      }),
    ]);
  });

  it('should remain resolving when a promise is return and is resolving and the component is unmounted', async () => {
    const {result, unmount} = renderUseInvokablePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    unmount();
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: UseInvokablePromiseStatus.Pending,
        error: undefined,
      }),
    ]);
  });

  it('should be unknown when rerendered and no promise is returned', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokablePromise(
          step === 0
            ? () => delay(() => Promise.resolve({foo: 'bar'}))
            : undefined,
          [step],
        ),
      {initialProps: {step: 0}},
    );
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    await waitForNextUpdate();
    rerender({step: 1});
    await act(async () => {
      // run async and don't wait
      await expect(result.current[0]()).rejects.toThrow(
        /The invoke function cannot be called at this time because the factory didn't return a promise./,
      );
    });
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  it('should be resolving when rerendered and a promise is returned and is resolving', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokablePromise(
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
      result.current[0]();
    });
    await waitForNextUpdate();
    rerender({step: 1});
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    expect(result.current).toEqual([
      expect.any(Function),
      undefined,
      expect.objectContaining({
        status: UseInvokablePromiseStatus.Pending,
        error: undefined,
      }),
    ]);
  });

  it('should be resolved when rerendered and a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useInvokablePromise(
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
      result.current[0]();
    });
    await waitForNextUpdate();
    rerender({step: 1});
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    await waitForNextUpdate();
    expect(result.current).toEqual([
      expect.any(Function),
      {bar: 'foo'},
      expect.objectContaining({
        status: UseInvokablePromiseStatus.Fulfilled,
        error: undefined,
      }),
    ]);
  });

  it('should not update state with the result of an old promise when an old promise resolves after the current promise', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useInvokablePromise(() => delay(() => Promise.resolve(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    expect(result.current[2].isPending).toBeTruthy();
    rerender({ms: 10});
    act(() => {
      result.current[0]();
    });
    await waitForNextUpdate();
    await delay(async () => {
      expect(result.current).toEqual([
        expect.any(Function),
        10,
        expect.objectContaining({
          status: UseInvokablePromiseStatus.Fulfilled,
          error: undefined,
        }),
      ]);
    }, 100);
  });

  it('should not update state with the result of an old promise when an old promise rejects after the current promise', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useInvokablePromise(() => delay(() => Promise.reject(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => {
      // run async and don't wait
      result.current[0]();
    });
    expect(result.current[2].isPending).toBeTruthy();
    rerender({ms: 10});
    act(() => {
      result.current[0]();
    });
    await waitForNextUpdate();
    await delay(async () => {
      expect(result.current).toEqual([
        expect.any(Function),
        undefined,
        expect.objectContaining({
          status: UseInvokablePromiseStatus.Rejected,
          error: 10,
        }),
      ]);
    }, 100);
  });

  it('should return the value from the invoke function', async () => {
    expect.assertions(1);
    const {result} = renderUseInvokablePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    await act(async () => {
      const value = await result.current[0]();
      expect(value).toEqual({foo: 'bar'});
    });
  });

  it('should throw an error from the invoke function', async () => {
    expect.assertions(1);
    const {result} = renderUseInvokablePromiseHook(undefined);
    await act(async () => {
      await expect(result.current[0]()).rejects.toThrowError();
    });
  });
});
