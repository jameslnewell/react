import React, {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Factory} from './types';
import {
  useDeferredPromise,
  UseDeferredPromiseOptions,
} from './useDeferredPromise';
import {
  createEventuallyFulfilledPromise,
  createEventuallyRejectedPromise,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  RenderJSON,
} from './__fixtures__';

export default {
  title: 'react-promise/useDeferredPromise',
};
interface UseDeferredPromiseProps {
  factory?: Factory<unknown[], unknown>;
  options?: UseDeferredPromiseOptions;
}

const UseDeferredPromise: React.FC<UseDeferredPromiseProps> = ({
  factory,
  options,
}) => {
  const result = useDeferredPromise(factory, options);
  return (
    <>
      <button onClick={() => result.invoke()}>Invoke</button>
      <RenderJSON value={result} />
    </>
  );
};

export const NoFactory: React.FC = () => {
  return <UseDeferredPromise factory={undefined} />;
};

export const Pending: React.FC = () => {
  return <UseDeferredPromise factory={createPendingPromise} />;
};

export const Fulfilled: React.FC = () => {
  return <UseDeferredPromise factory={createFulfilledPromise} />;
};

export const Rejected: React.FC = () => {
  return <UseDeferredPromise factory={createRejectedPromise} />;
};

export const EventuallyFulfilled: React.FC = () => {
  return (
    <UseDeferredPromise
      factory={() => createEventuallyFulfilledPromise(1000)}
    />
  );
};

export const EventuallyRejected: React.FC = () => {
  return (
    <UseDeferredPromise factory={() => createEventuallyRejectedPromise(1000)} />
  );
};

export const Suspended: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredPromise
        factory={createPendingPromise}
        options={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const Thrown: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UseDeferredPromise
        factory={createRejectedPromise}
        options={{throwWhenRejected: true}}
      />
    </ErrorBoundary>
  );
};

export const SuspendedEventuallyFulfilled: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredPromise
        factory={createEventuallyFulfilledPromise}
        options={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const SuspendedEventuallyRejected: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UseDeferredPromise
        factory={createEventuallyRejectedPromise}
        options={{throwWhenRejected: true}}
      />
    </ErrorBoundary>
  );
};
