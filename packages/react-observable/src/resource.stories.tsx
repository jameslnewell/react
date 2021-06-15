import React from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {
  createCompletedObservable,
  createErroredObservable,
  createEventuallyCompletedObservable,
  createEventuallyErroredObservable,
  createReceivedObservable,
  createReceivingObservable,
  createWaitingObservable,
} from './__fixtures__';
import {Resource, createResource, useResource} from './resource';

export default {
  title: 'react-observable/resource',
};

const ReadResource: React.FC<{resource: Resource<unknown>}> = withSuspense()(
  withErrorBoundary()(({resource}) => {
    const value = useResource(resource);
    return <RenderJSON value={value} />;
  }),
);

const suspendWhenWaitingResource = createResource(createWaitingObservable());
export const SuspendWhenWaiting: React.FC = () => (
  <ReadResource resource={suspendWhenWaitingResource} />
);

const returnWhenReceivedResource = createResource(createReceivedObservable());
export const ReturnWhenReceived: React.FC = () => (
  <ReadResource resource={returnWhenReceivedResource} />
);

const returnWhenCompletedResource = createResource(createCompletedObservable());
export const ReturnWhenCompleted: React.FC = () => (
  <ReadResource resource={returnWhenCompletedResource} />
);

const throwErrorWhenErroredResource = createResource(createErroredObservable());
export const ThrowWhenErrored: React.FC = () => (
  <ReadResource resource={throwErrorWhenErroredResource} />
);

const eventuallyLoadedResource = createResource(
  createEventuallyCompletedObservable(),
);
export const EventuallyLoaded: React.FC = () => (
  <ReadResource resource={eventuallyLoadedResource} />
);

const eventuallyErroredResource = createResource(
  createEventuallyErroredObservable(),
);
export const EventuallyErrored: React.FC = () => (
  <ReadResource resource={eventuallyErroredResource} />
);

const subscribedResource = createResource(createReceivingObservable());
export const Subscribed: React.FC = () => (
  <ReadResource resource={subscribedResource} />
);

export const RenderAsYouFetch: React.FC = () => {
  const [resource, setResource] = React.useState<Resource<number> | undefined>(
    undefined,
  );
  return (
    <>
      <button
        onClick={() => setResource(createResource(createReceivingObservable()))}
      >
        Create resource
      </button>
      {resource && <ReadResource resource={resource} />}
    </>
  );
};
