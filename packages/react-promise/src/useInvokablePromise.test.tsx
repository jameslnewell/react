import {renderHook, act} from '@testing-library/react-hooks';
import {useInvokablePromise} from './useInvokablePromise';
import {
  createFulfilledPromise,
  createRejectedPromise,
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createPendingPromise,
  error,
  value,
} from './__fixtures__';
import {
  createEmptyState,
  createErroredState,
  createLoadedState,
  createLoadingState,
} from './state';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function renderuseInvokablePromise(
  factory: () => Promise<unknown> | undefined,
) {
  return renderHook(() => useInvokablePromise(factory));
}

describe('useInvokablePromise()', () => {
  test('is undefined when not invoked', () => {
    const {result} = renderuseInvokablePromise(createPendingPromise);
    expect(result.current).toEqual(expect.objectContaining(createEmptyState()));
  });
  test('throws an error when invoked and the factory does not return a promise', () => {
    const {result} = renderuseInvokablePromise(() => undefined);
    act(() => {
      expect(() => result.current.invoke()).toThrowError(
        'Factory did not return a promise.',
      );
    });
  });
  test('is loading when pending', () => {
    const {result} = renderuseInvokablePromise(createPendingPromise);
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
  });
  test('is loaded when fulfilled', async () => {
    const {result, waitForValueToChange} = renderuseInvokablePromise(
      createFulfilledPromise,
    );
    act(() => {
      result.current.invoke();
    });
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('is errored when rejected', async () => {
    const {result, waitForValueToChange} = renderuseInvokablePromise(
      createRejectedPromise,
    );
    act(() => {
      result.current.invoke();
    });
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('eventually loads', async () => {
    const {result, waitForValueToChange} = renderuseInvokablePromise(
      createEventuallyFulfilledPromise,
    );
    act(() => {
      result.current.invoke();
    });
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState(value)),
    );
  });
  test('eventually errors', async () => {
    const {result, waitForValueToChange} = renderuseInvokablePromise(
      createEventuallyRejectedPromise,
    );
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current, {timeout: 4000});
    expect(result.current).toEqual(
      expect.objectContaining(createErroredState(error)),
    );
  });
  test('rendered with a new promise', async () => {
    const factory1 = (): Promise<string> =>
      new Promise((resolve) => setTimeout(() => resolve('foo'), 500));
    const factory2 = (): Promise<string> =>
      new Promise((resolve) => setTimeout(() => resolve('bar'), 500));
    const {result, rerender, waitForValueToChange} = renderHook(
      ({
        factory,
      }: {
        factory: () => Promise<string> | undefined;
        deps: unknown[];
      }) => useInvokablePromise(factory),
      {initialProps: {factory: factory1, deps: [factory1]}},
    );
    expect(result.current).toEqual(expect.objectContaining(createEmptyState()));
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState('foo')),
    );
    rerender({factory: factory2, deps: [factory2]});
    expect(result.current).toEqual(expect.objectContaining(createEmptyState()));
    act(() => {
      result.current.invoke();
    });
    expect(result.current).toEqual(
      expect.objectContaining(createLoadingState()),
    );
    await waitForValueToChange(() => result.current);
    expect(result.current).toEqual(
      expect.objectContaining(createLoadedState('bar')),
    );
  });
});
