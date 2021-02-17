import React, {Suspense} from 'react';
import {RenderJSON, withSuspense, withErrorBoundary} from 'testing-utilities';
import {Factory} from './types';
import {
  useDeferredObservable,
  UseDeferredObservableOptions,
} from './useDeferredObservable';
import {
  createEventuallyCompletedObservable,
  createEventuallyErroredObservable,
  createCompletedObservable,
  createWaitingObservable,
  createErroredObservable,
  createReceivedObservable,
} from './__fixtures__';

export default {
  title: 'react-observable/useDeferredObservable',
};
interface UseDeferredObservableProps {
  keys: unknown[];
  factory: Factory<unknown[], unknown> | undefined;
  options?: UseDeferredObservableOptions;
}

const UseDeferredObservable: React.FC<UseDeferredObservableProps> = ({
  keys,
  factory,
  options,
}) => {
  const result = useDeferredObservable(keys, factory, options);
  return (
    <>
      <button onClick={() => result.invoke()}>Invoke</button>
      <RenderJSON value={result} />
    </>
  );
};

export const WithoutAFactory: React.FC = () => {
  return <UseDeferredObservable keys={[Symbol()]} factory={undefined} />;
};

export const Waiting: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createWaitingObservable}
    />
  );
};

export const Received: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createReceivedObservable}
    />
  );
};

export const Completed: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createCompletedObservable}
    />
  );
};

export const Errored: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createErroredObservable}
    />
  );
};

export const EventuallyCompleted: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createEventuallyCompletedObservable}
    />
  );
};

export const EventuallyErrored: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createEventuallyErroredObservable}
    />
  );
};

export const Suspended: React.FC = withSuspense()(() => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createWaitingObservable}
      options={{suspendWhenWaiting: true}}
    />
  );
});

export const Thrown: React.FC = withErrorBoundary()(() => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createErroredObservable}
      options={{throwWhenErrored: true}}
    />
  );
});

export const SuspendedEventuallyCompleted: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredObservable
        keys={[Symbol()]}
        factory={createEventuallyCompletedObservable}
        options={{suspendWhenWaiting: true}}
      />
    </Suspense>
  );
};

export const ThrownEventuallyErrored: React.FC = withErrorBoundary()(() => {
  return (
    <UseDeferredObservable
      keys={[Symbol()]}
      factory={createEventuallyErroredObservable}
      options={{throwWhenErrored: true}}
    />
  );
});
