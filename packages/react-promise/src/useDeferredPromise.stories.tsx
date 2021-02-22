import React, {Suspense} from 'react';
import {RenderJSON, withSuspense, withErrorBoundary} from 'testing-utilities';
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
} from './__fixtures__';

export default {
  title: 'react-promise/useDeferredPromise',
};
interface UseDeferredPromiseProps {
  keys: unknown[];
  factory: Factory<unknown[], unknown>;
  options?: UseDeferredPromiseOptions;
}

const UseDeferredPromise: React.FC<UseDeferredPromiseProps> = ({
  keys,
  factory,
  options,
}) => {
  const result = useDeferredPromise(keys, factory, options);
  return (
    <>
      <button onClick={() => result.invoke()}>Invoke</button>
      <RenderJSON value={result} />
    </>
  );
};

export const Pending: React.FC = () => {
  return (
    <UseDeferredPromise keys={['Pending']} factory={createPendingPromise} />
  );
};

export const Fulfilled: React.FC = () => {
  return (
    <UseDeferredPromise keys={['Fulfilled']} factory={createFulfilledPromise} />
  );
};

export const Rejected: React.FC = () => {
  return (
    <UseDeferredPromise keys={['Rejected']} factory={createRejectedPromise} />
  );
};

export const EventuallyFulfilled: React.FC = () => {
  return (
    <UseDeferredPromise
      keys={['EventuallyFulfilled']}
      factory={createEventuallyFulfilledPromise}
    />
  );
};

export const EventuallyRejected: React.FC = () => {
  return (
    <UseDeferredPromise
      keys={['EventuallyRejected']}
      factory={createEventuallyRejectedPromise}
    />
  );
};

export const Suspended: React.FC = withSuspense()(() => {
  return (
    <UseDeferredPromise
      keys={['Suspended']}
      factory={createPendingPromise}
      options={{suspendWhenPending: true}}
    />
  );
});

export const Thrown: React.FC = withErrorBoundary()(() => {
  return (
    <UseDeferredPromise
      keys={['Thrown']}
      factory={createRejectedPromise}
      options={{throwWhenRejected: true}}
    />
  );
});

export const SuspendedEventuallyFulfilled: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredPromise
        keys={['SuspendedEventuallyFulfilled']}
        factory={createEventuallyFulfilledPromise}
        options={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const ThrownEventuallyRejected: React.FC = withErrorBoundary()(() => {
  return (
    <UseDeferredPromise
      keys={['ThrownEventuallyRejected']}
      factory={createEventuallyRejectedPromise}
      options={{throwWhenRejected: true}}
    />
  );
});
