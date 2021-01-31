import React, {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Factory} from './Resource';
import {useDeferredPromise} from './useDeferredPromise';
import {UsePromiseOptions} from './usePromise';
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
  fn?: Factory<unknown[], unknown>;
  opts?: UsePromiseOptions;
}

const UseDeferredPromise: React.FC<UseDeferredPromiseProps> = ({fn, opts}) => {
  const result = useDeferredPromise(fn, opts);
  return (
    <>
      <button onClick={() => result.invoke()}>Invoke</button>
      <RenderJSON value={result} />
    </>
  );
};

export const NoFactory: React.FC = () => {
  return <UseDeferredPromise fn={undefined} />;
};

export const Pending: React.FC = () => {
  return <UseDeferredPromise fn={createPendingPromise} />;
};

export const Fulfilled: React.FC = () => {
  return <UseDeferredPromise fn={createFulfilledPromise} />;
};

export const Rejected: React.FC = () => {
  return <UseDeferredPromise fn={createRejectedPromise} />;
};

export const EventuallyFulfilled: React.FC = () => {
  return <UseDeferredPromise fn={createEventuallyFulfilledPromise} />;
};

export const EventuallyRejected: React.FC = () => {
  return <UseDeferredPromise fn={createEventuallyRejectedPromise} />;
};

export const Suspended: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredPromise
        fn={createPendingPromise}
        opts={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const Thrown: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UseDeferredPromise
        fn={createRejectedPromise}
        opts={{throwWhenRejected: true}}
      />
    </ErrorBoundary>
  );
};

export const SuspendedEventuallyFulfilled: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredPromise
        fn={createEventuallyFulfilledPromise}
        opts={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const SuspendedEventuallyRejected: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UseDeferredPromise
        fn={createEventuallyRejectedPromise}
        opts={{throwWhenRejected: true}}
      />
    </ErrorBoundary>
  );
};
