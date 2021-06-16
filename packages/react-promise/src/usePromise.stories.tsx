import React from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
} from './__fixtures__';
import {usePromise} from './usePromise';

export default {
  title: 'react-promise/usePromise',
};

const ReadPromise: React.FC<{
  promise: Promise<unknown>;
}> = withSuspense()(
  withErrorBoundary()(({promise}) => {
    const state = usePromise(promise);
    return <RenderJSON value={state} />;
  }),
);

const loadingWhenPendingPromise = createPendingPromise();
export const LoadingWhenPending: React.FC = () => (
  <ReadPromise promise={loadingWhenPendingPromise} />
);

const loadedWhenFulfilledPromise = createFulfilledPromise();
export const LoadedWhenFulfilled: React.FC = () => (
  <ReadPromise promise={loadedWhenFulfilledPromise} />
);

const erroredWhenRejectedPromise = createRejectedPromise();
export const ErroredWhenRejected: React.FC = () => (
  <ReadPromise promise={erroredWhenRejectedPromise} />
);

const eventuallyLoadedWhenFulfilledPromise = createEventuallyFulfilledPromise();
export const EventuallyLoadedWhenFulfilled: React.FC = () => (
  <ReadPromise promise={eventuallyLoadedWhenFulfilledPromise} />
);

const eventuallyRejectedWhenRejectedPromise = createEventuallyRejectedPromise();
export const EventuallyErroredWhenRejected: React.FC = () => (
  <ReadPromise promise={eventuallyRejectedWhenRejectedPromise} />
);
