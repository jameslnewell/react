import React, {Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Factory} from './types';
import {
  useDeferredObservable,
  UseDeferredObservableOptions,
} from './useDeferredObservable';
import {
  createCompletedObservable,
  createErroredObservable,
  createEventuallyCompletedObservable,
  createEventuallyErroredObservable,
  createReceivedObservable,
  createWaitingObservable,
  RenderJSON,
} from './__fixtures__';

export default {
  title: 'react-observable/useDeferredObservable',
};
interface UseDeferredObservableProps {
  factory?: Factory<unknown[], unknown>;
  options?: UseDeferredObservableOptions;
}

const UseDeferredObservable: React.FC<UseDeferredObservableProps> = ({
  factory,
  options,
}) => {
  const result = useDeferredObservable(factory, options);
  return (
    <>
      <button onClick={() => result.invoke()}>Invoke</button>
      <RenderJSON value={result} />
    </>
  );
};

export const NoFactory: React.FC = () => {
  return <UseDeferredObservable factory={undefined} />;
};

export const Waiting: React.FC = () => {
  return <UseDeferredObservable factory={createWaitingObservable} />;
};

export const Received: React.FC = () => {
  return <UseDeferredObservable factory={createReceivedObservable} />;
};

export const Completed: React.FC = () => {
  return <UseDeferredObservable factory={createCompletedObservable} />;
};

export const Errored: React.FC = () => {
  return <UseDeferredObservable factory={createErroredObservable} />;
};

export const EventuallyCompleted: React.FC = () => {
  return (
    <UseDeferredObservable factory={createEventuallyCompletedObservable} />
  );
};

export const EventuallyErrored: React.FC = () => {
  return <UseDeferredObservable factory={createEventuallyErroredObservable} />;
};

export const Suspended: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredObservable
        factory={createWaitingObservable}
        options={{suspendWhenWaiting: true}}
      />
    </Suspense>
  );
};

export const Thrown: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UseDeferredObservable
        factory={createErroredObservable}
        options={{throwWhenErrored: true}}
      />
    </ErrorBoundary>
  );
};

export const SuspendedEventuallyCompleted: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredObservable
        factory={createEventuallyCompletedObservable}
        options={{suspendWhenWaiting: true}}
      />
    </Suspense>
  );
};

export const SuspendedEventuallyErrored: React.FC = () => {
  return (
    <ErrorBoundary fallbackRender={() => <p>Error!</p>}>
      <UseDeferredObservable
        factory={createEventuallyErroredObservable}
        options={{throwWhenErrored: true}}
      />
    </ErrorBoundary>
  );
};
