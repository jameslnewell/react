import React from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
} from './__fixtures__';
import {useInvokablePromise} from './useInvokablePromise';

export default {
  title: 'react-promise/useInvokablePromise',
};

const ReadPromise: React.FC<{
  factory: () => Promise<unknown>;
}> = withSuspense()(
  withErrorBoundary()(({factory}) => {
    const {invoke, ...state} = useInvokablePromise(factory);
    return (
      <>
        <button onClick={invoke}>Invoke</button>
        <RenderJSON value={state} />
      </>
    );
  }),
);

const loadingWhenPendingPromise = (): Promise<unknown> =>
  createPendingPromise();
export const LoadingWhenPending: React.FC = () => (
  <ReadPromise factory={loadingWhenPendingPromise} />
);

const loadedWhenFulfilledPromise = (): Promise<unknown> =>
  createFulfilledPromise();
export const LoadedWhenFulfilled: React.FC = () => (
  <ReadPromise factory={loadedWhenFulfilledPromise} />
);

const erroredWhenRejectedPromise = (): Promise<unknown> =>
  createRejectedPromise();
export const ErroredWhenRejected: React.FC = () => (
  <ReadPromise factory={erroredWhenRejectedPromise} />
);

const eventuallyFulfilledPromise = (): Promise<unknown> =>
  createEventuallyFulfilledPromise();
export const EventuallyLoadedWhenFulfilled: React.FC = () => (
  <ReadPromise factory={eventuallyFulfilledPromise} />
);

const eventuallyErroredPromise = (): Promise<unknown> =>
  createEventuallyRejectedPromise();
export const EventuallyErroredWhenRejected: React.FC = () => (
  <ReadPromise factory={eventuallyErroredPromise} />
);
