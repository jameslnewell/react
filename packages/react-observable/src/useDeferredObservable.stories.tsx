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
  return (
    <UseDeferredObservable keys={['WithoutAFactory']} factory={undefined} />
  );
};

export const Waiting: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={['Waiting']}
      factory={createWaitingObservable}
    />
  );
};

export const Received: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={['Received']}
      factory={createReceivedObservable}
    />
  );
};

export const Completed: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={['Completed']}
      factory={createCompletedObservable}
    />
  );
};

export const Errored: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={['Errored']}
      factory={createErroredObservable}
    />
  );
};

export const EventuallyCompleted: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={['EventuallyCompleted']}
      factory={createEventuallyCompletedObservable}
    />
  );
};

export const EventuallyErrored: React.FC = () => {
  return (
    <UseDeferredObservable
      keys={['EventuallyErrored']}
      factory={createEventuallyErroredObservable}
    />
  );
};

export const Suspended: React.FC = withSuspense()(() => {
  return (
    <UseDeferredObservable
      keys={['Suspended']}
      factory={createWaitingObservable}
      options={{suspendWhenWaiting: true}}
    />
  );
});

export const Thrown: React.FC = withErrorBoundary()(() => {
  return (
    <UseDeferredObservable
      keys={['Thrown']}
      factory={createErroredObservable}
      options={{throwWhenErrored: true}}
    />
  );
});

export const SuspendedEventuallyCompleted: React.FC = () => {
  return (
    <Suspense fallback={<p>Suspended!</p>}>
      <UseDeferredObservable
        keys={['SuspendedEventuallyCompleted']}
        factory={createEventuallyCompletedObservable}
        options={{suspendWhenWaiting: true}}
      />
    </Suspense>
  );
};

export const ThrownEventuallyErrored: React.FC = withErrorBoundary()(() => {
  return (
    <UseDeferredObservable
      keys={['ThrownEventuallyErrored']}
      factory={createEventuallyErroredObservable}
      options={{throwWhenErrored: true}}
    />
  );
});
