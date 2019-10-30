import {renderHook} from '@testing-library/react-hooks';
import {Status, Factory, usePromise} from '.';

describe('usePromise()', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function renderUsePromiseHook<T>(fn: Factory<T> | undefined) {
    return renderHook(() => usePromise(fn));
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

  it('should be unknown when no promise is returned', async () => {
    const {result} = renderUsePromiseHook(undefined);
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: undefined,
        error: undefined,
      }),
    ]);
  });

  it('should be resolving when a promise is returned and is resolving', async () => {
    const {result} = renderUsePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
      }),
    ]);
  });

  it('should be resolved when a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate} = renderUsePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    await waitForNextUpdate();
    expect(result.current).toEqual([
      {foo: 'bar'},
      expect.objectContaining({
        status: Status.Fulfilled,
        error: undefined,
      }),
    ]);
  });

  it('should be rejected when a promise is returned and is rejected', async () => {
    const {result, waitForNextUpdate} = renderUsePromiseHook(() =>
      delay(() => Promise.reject(new Error('This is a test error!'))),
    );
    await waitForNextUpdate();
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: Status.Rejected,
        error: new Error('This is a test error!'),
      }),
    ]);
  });

  it('should remain resolving when a promise is return and is resolving and the component is unmounted', async () => {
    const {result, unmount} = renderUsePromiseHook(() =>
      delay(() => Promise.resolve({foo: 'bar'})),
    );
    unmount();
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
      }),
    ]);
  });

  it('should be unknown when rerendered and no promise is returned', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        usePromise(
          step === 0
            ? () => delay(() => Promise.resolve({foo: 'bar'}))
            : undefined,
          [step],
        ),
      {initialProps: {step: 0}},
    );
    await waitForNextUpdate();
    rerender({step: 1});
    expect(result.current).toEqual([
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
        usePromise(
          () =>
            delay(() =>
              Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'}),
            ),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    await waitForNextUpdate();
    rerender({step: 1});
    expect(result.current).toEqual([
      undefined,
      expect.objectContaining({
        status: Status.Pending,
        error: undefined,
      }),
    ]);
  });

  it('should be resolved when rerendered and a promise is returned and is resolved', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        usePromise(
          () =>
            delay(() =>
              Promise.resolve(step === 0 ? {foo: 'bar'} : {bar: 'foo'}),
            ),
          [step],
        ),
      {initialProps: {step: 0}},
    );
    await waitForNextUpdate();
    rerender({step: 1});
    await waitForNextUpdate();
    expect(result.current).toEqual([
      {bar: 'foo'},
      expect.objectContaining({
        status: Status.Fulfilled,
        error: undefined,
      }),
    ]);
  });

  it('should not update state with the result of an old promise when an old promise resolves after the current promise', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        usePromise(() => delay(() => Promise.resolve(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    expect(result.current[1].isPending).toBeTruthy();
    rerender({ms: 10});
    await waitForNextUpdate();
    await delay(async () => {
      expect(result.current).toEqual([
        10,
        expect.objectContaining({
          status: Status.Fulfilled,
          error: undefined,
        }),
      ]);
    }, 100);
  });

  it('should not update state with the result of an old promise when an old promise rejects after the current promise', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        usePromise(() => delay(() => Promise.reject(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    expect(result.current[1].isPending).toBeTruthy();
    rerender({ms: 10});
    await waitForNextUpdate();
    await delay(async () => {
      expect(result.current).toEqual([
        undefined,
        expect.objectContaining({
          status: Status.Rejected,
          error: 10,
        }),
      ]);
    }, 100);
  });
});
