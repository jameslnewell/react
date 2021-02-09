import React, {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Factory} from './types';
import {usePromise, UsePromiseOptions} from './usePromise';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  RenderJSON,
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

export const Suspended: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UsePromise
        factory={createPendingPromise}
        options={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const Thrown: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UsePromise
        factory={createRejectedPromise}
        options={{throwWhenRejected: true}}
      />
    </ErrorBoundary>
  );
};

export const SuspendedEventuallyFulfilled: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UsePromise
        factory={createEventuallyFulfilledPromise}
        options={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const SuspendedEventuallyRejected: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UsePromise
        factory={createEventuallyRejectedPromise}
        options={{throwWhenRejected: true}}
      />
    </ErrorBoundary>
  );
};
