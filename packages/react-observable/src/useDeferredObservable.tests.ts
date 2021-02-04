import {renderHook, act} from '@testing-library/react-hooks';
import {fromArray} from '@jameslnewell/observable';
import {useDeferredObservable} from '.';
import {Factory, Status} from './Resource';
import {
  value,
  error,
  completedState,
  createCompletedObservable,
  createErroredObservable,
  createReceivedObservable,
  createWaitingObservable,
  erroredState,
  unknownState,
  waitingState,
  receivedState,
} from './__fixtures__';

describe('useDeferredObservable()', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function renderUseInvokableObservableHook<
    Parameters extends unknown[],
    Value,
    Error
  >(factory: Factory<Parameters, Value, Error> | undefined) {
    return renderHook(() => useDeferredObservable(factory));
  }

  test('state is unknown when no factory was provided', async () => {
    const {result} = renderUseInvokableObservableHook(undefined);
    expect(result.current).toEqual(expect.objectContaining(unknownState));
  });

  test('state is unknown when a factory is provided but not yet invoked', async () => {
    const {result} = renderUseInvokableObservableHook(createWaitingObservable);
    expect(result.current).toEqual(expect.objectContaining(unknownState));
  });

  test('state is waiting when a factory is provided, when it has been invoked and is waiting for a value', async () => {
    const {result} = renderUseInvokableObservableHook(createWaitingObservable);
    act(() => result.current.invoke());
    expect(result.current).toEqual(expect.objectContaining(waitingState));
  });

  test.only('state is received when a factory is provided, when it has been invoked and a value is received', async () => {
    const {result} = renderUseInvokableObservableHook(createReceivedObservable);
    act(() => result.current.invoke());
    expect(result.current).toEqual(expect.objectContaining(receivedState));
  });

  test('state is completed state when a factory is provided, when it has been invoked and has completed', async () => {
    const {result} = renderUseInvokableObservableHook(
      createCompletedObservable,
    );
    act(() => result.current.invoke());
    expect(result.current).toEqual(expect.objectContaining(completedState));
  });

  test('state is errored when a factory is provided, when it has been invoked and has errored', async () => {
    const {result} = renderUseInvokableObservableHook(createErroredObservable);
    act(() => result.current.invoke());
    expect(result.current).toEqual(expect.objectContaining(erroredState));
  });

  test('state is waiting when a factory is provided, when it has been invoked and is waiting and the component is unmounted', async () => {
    const {result, unmount} = renderUseInvokableObservableHook(
      createWaitingObservable,
    );
    act(() => result.current.invoke());
    unmount();
    expect(result.current).toEqual(expect.objectContaining(waitingState));
  });

  test('is in unknown state when rerendered and no observable is provided', async () => {
    const {result, rerender} = renderHook(
      ({step}: {step: 0 | 1}) =>
        useDeferredObservable(
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
        useDeferredObservable(() => (step === 0 ? received() : waiting()), [
          step,
        ]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    act(() => result.current.invoke());
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
        useDeferredObservable(() => (step === 0 ? completed() : received()), [
          step,
        ]),
      {initialProps: {step: 0}},
    );
    rerender({step: 1});
    act(() => result.current.invoke());
    expect(result.current).toEqual([
      expect.any(Function),
      1,
      expect.objectContaining({
        status: Status.Receieved,
        error: undefined,
      }),
    ]);
  });

  test('should not update state with the result of an old observable when an old observable publishes a value after the current observable', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useDeferredObservable(() => delay(received(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => result.current.invoke());
    expect(result.current[2].isWaiting).toBeTruthy();
    rerender({ms: 10});
    act(() => result.current.invoke());
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

  test('should not update state with the result of an old observable when an old observable errored after the current observable', async () => {
    const {result, waitForNextUpdate, rerender} = renderHook(
      ({ms}: {ms: number}) =>
        useDeferredObservable(() => delay(errored(ms), ms), [ms]),
      {initialProps: {ms: 100}},
    );
    act(() => result.current.invoke());
    expect(result.current[2].isWaiting).toBeTruthy();
    rerender({ms: 10});
    act(() => result.current.invoke());
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
