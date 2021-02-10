import React, {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Factory} from './types';
import {useObservable, UseObservableOptions} from './useObservable';
import {
  createEventuallyFulfilledPromise,
  createEventuallyErroredObservable,
  createFulfilledPromise,
  createPendingPromise,
  createRejectedPromise,
  RenderJSON,
  createWaitingObservable,
  createCompletedObservable,
  createReceivedObservable,
  createErroredObservable,
  createEventuallyCompletedObservable,
} from './__fixtures__';

export default {
  title: 'react-observable/useObservable',
};

interface UsePromiseProps {
  factory?: Factory<unknown[], unknown>;
  options?: UseObservableOptions;
}

const UsePromise: React.FC<UsePromiseProps> = ({factory, options}) => {
  const result = useObservable(factory, options);
  return <RenderJSON value={result} />;
};

export const NoFactory: React.FC = () => {
  return <UsePromise factory={undefined} />;
};

export const Waiting: React.FC = () => {
  return <UsePromise factory={createWaitingObservable} />;
};

export const Received: React.FC = () => {
  return <UsePromise factory={createReceivedObservable} />;
};

export const Completed: React.FC = () => {
  return <UsePromise factory={createCompletedObservable} />;
};

export const Errored: React.FC = () => {
  return <UsePromise factory={createErroredObservable} />;
};

export const EventuallyCompleted: React.FC = () => {
  return <UsePromise factory={createEventuallyCompletedObservable} />;
};

export const EventuallyErrored: React.FC = () => {
  return <UsePromise factory={createEventuallyErroredObservable} />;
};

export const Suspended: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UsePromise
        factory={createWaitingObservable}
        options={{suspendWhenWaiting: true}}
      />
    </Suspense>
  );
};

export const Thrown: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UsePromise
        factory={createErroredObservable}
        options={{throwWhenErrored: true}}
      />
    </ErrorBoundary>
  );
};

export const SuspendedEventuallyCompleted: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UsePromise
        factory={createEventuallyCompletedObservable}
        options={{suspendWhenWaiting: true}}
      />
    </Suspense>
  );
};

export const ThrownEventuallyErrored: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UsePromise
        factory={createEventuallyErroredObservable}
        options={{throwWhenErrored: true}}
      />
    </ErrorBoundary>
  );
};
