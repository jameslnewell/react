import React from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {Factory} from './types';
import {usePromise, UsePromiseOptions} from './usePromise';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
} from './__fixtures__';

export default {
  title: 'react-promise/usePromise',
};

interface UsePromiseProps {
  factory?: Factory<unknown[], unknown>;
  options?: UsePromiseOptions;
}

const UsePromise: React.FC<UsePromiseProps> = ({factory, options}) => {
  const result = usePromise(factory, options);
  return <RenderJSON value={result} />;
};

export const NoFactory: React.FC = () => {
  return <UsePromise factory={undefined} />;
};

export const Pending: React.FC = () => {
  return <UsePromise factory={createPendingPromise} />;
};

export const Fulfilled: React.FC = () => {
  return <UsePromise factory={createFulfilledPromise} />;
};

export const Rejected: React.FC = () => {
  return <UsePromise factory={createRejectedPromise} />;
};

export const EventuallyFulfilled: React.FC = () => {
  return <UsePromise factory={createEventuallyFulfilledPromise} />;
};

export const EventuallyRejected: React.FC = () => {
  return <UsePromise factory={createEventuallyRejectedPromise} />;
};

export const Suspended: React.FC = withSuspense()(() => {
  return (
    <UsePromise
      factory={createPendingPromise}
      options={{suspendWhenPending: true}}
    />
  );
});

export const Thrown: React.FC = withErrorBoundary()(() => {
  return (
    <UsePromise
      factory={createRejectedPromise}
      options={{throwWhenRejected: true}}
    />
  );
});

export const SuspendedEventuallyFulfilled: React.FC = withSuspense()(() => {
  return (
    <UsePromise
      factory={createEventuallyFulfilledPromise}
      options={{suspendWhenPending: true}}
    />
  );
});

export const ThrownEventuallyRejected: React.FC = withErrorBoundary()(() => {
  return (
    <UsePromise
      factory={createEventuallyRejectedPromise}
      options={{throwWhenRejected: true}}
    />
  );
});
