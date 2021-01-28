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
  fn?: Factory;
  opts?: UsePromiseOptions;
}

const UsePromise: React.FC<UsePromiseProps> = ({fn, opts}) => {
  const result = usePromise(fn, opts);
  return <RenderJSON value={result} />;
};

export const NoFactory: React.FC = () => {
  return <UsePromise fn={undefined} />;
};

export const Pending: React.FC = () => {
  return <UsePromise fn={createPendingPromise} />;
};

export const Fulfilled: React.FC = () => {
  return <UsePromise fn={createFulfilledPromise} />;
};

export const Rejected: React.FC = () => {
  return <UsePromise fn={createRejectedPromise} />;
};

export const EventuallyFulfilled: React.FC = () => {
  return <UsePromise fn={createEventuallyFulfilledPromise} />;
};

export const EventuallyRejected: React.FC = () => {
  return <UsePromise fn={createEventuallyRejectedPromise} />;
};

export const Suspended: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UsePromise fn={createPendingPromise} opts={{suspendWhenPending: true}} />
    </Suspense>
  );
};

export const Thrown: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UsePromise fn={createRejectedPromise} opts={{throwWhenRejected: true}} />
    </ErrorBoundary>
  );
};

export const SuspendedEventuallyFulfilled: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UsePromise
        fn={createEventuallyFulfilledPromise}
        opts={{suspendWhenPending: true}}
      />
    </Suspense>
  );
};

export const SuspendedEventuallyRejected: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UsePromise
        fn={createEventuallyRejectedPromise}
        opts={{throwWhenRejected: true}}
      />
    </ErrorBoundary>
  );
};
