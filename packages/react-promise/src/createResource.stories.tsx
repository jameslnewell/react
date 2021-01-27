import React, {Suspense} from 'react';
import {createResource, CreateResourceResult} from './createResource';
import {
  createPendingPromise,
  createFulfilledPromise,
  createRejectedPromise,
  RenderJSON,
  Fallback,
  ErrorBoundary,
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
} from './__fixtures__';

export default {
  title: 'react-promise/createResource',
};

const pendingResource = createResource(createPendingPromise);
const fulfilledResource = createResource(createFulfilledPromise);
const rejectedResource = createResource(createRejectedPromise);
const eventuallyFulfilledResource = createResource(
  createEventuallyFulfilledPromise,
);
const eventuallyRejectedResource = createResource(
  createEventuallyRejectedPromise,
);

interface RenderResourceProps {
  resource: CreateResourceResult;
}

const RenderResource: React.FC<RenderResourceProps> = ({resource}) => {
  const value = resource.read();
  return <RenderJSON value={value} />;
};

export const Pending: React.FC = () => (
  <Suspense fallback={<Fallback />}>
    <RenderResource resource={pendingResource} />
  </Suspense>
);

export const Fulfilled: React.FC = () => (
  <Suspense fallback={<Fallback />}>
    <RenderResource resource={fulfilledResource} />
  </Suspense>
);

export const Rejected: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={<Fallback />}>
      <RenderResource resource={rejectedResource} />
    </Suspense>
  </ErrorBoundary>
);

export const EventuallyFulfilled: React.FC = () => (
  <Suspense fallback={<Fallback />}>
    <RenderResource resource={eventuallyFulfilledResource} />
  </Suspense>
);

export const EventuallyRejected: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={<Fallback />}>
      <RenderResource resource={eventuallyRejectedResource} />
    </Suspense>
  </ErrorBoundary>
);
