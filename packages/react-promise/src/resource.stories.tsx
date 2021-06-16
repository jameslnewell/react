import React from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
} from './__fixtures__';
import {Resource, createResource} from './resource';

export default {
  title: 'react-promise/resource',
};

const ReadResource: React.FC<{resource: Resource<unknown>}> = withSuspense()(
  withErrorBoundary()(({resource}) => {
    const value = resource.read();
    return <RenderJSON value={value} />;
  }),
);

const suspendWhenPendingResource = createResource(createPendingPromise());
export const SuspendWhenPending: React.FC = () => (
  <ReadResource resource={suspendWhenPendingResource} />
);

const returnWhenFulfilledResource = createResource(createFulfilledPromise());
export const ReturnWhenFulfilled: React.FC = () => (
  <ReadResource resource={returnWhenFulfilledResource} />
);

const throwErrorWhenRejectedResource = createResource(createRejectedPromise());
export const ThrowWhenRejected: React.FC = () => (
  <ReadResource resource={throwErrorWhenRejectedResource} />
);

const eventuallyLoadedWhenFulfilledResource = createResource(
  createEventuallyFulfilledPromise(),
);
export const EventuallyLoadedWhenFulfilled: React.FC = () => (
  <ReadResource resource={eventuallyLoadedWhenFulfilledResource} />
);

const eventuallyErroredWhenRejectedResource = createResource(
  createEventuallyRejectedPromise(),
);
export const EventuallyErroredWhenRejected: React.FC = () => (
  <ReadResource resource={eventuallyErroredWhenRejectedResource} />
);

export const RenderAsYouFetch: React.FC = () => {
  const [resource, setResource] = React.useState<Resource<string> | undefined>(
    undefined,
  );
  return (
    <>
      <button
        onClick={() =>
          setResource(createResource(createEventuallyFulfilledPromise()))
        }
      >
        Create resource
      </button>
      {resource && <ReadResource resource={resource} />}
    </>
  );
};
