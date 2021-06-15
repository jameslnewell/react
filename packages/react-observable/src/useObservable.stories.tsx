import React from 'react';
import {RenderJSON, withErrorBoundary, withSuspense} from 'testing-utilities';
import {
  createCompletedObservable,
  createErroredObservable,
  createEventuallyCompletedObservable,
  createEventuallyErroredObservable,
  createReceivedObservable,
  createReceivingObservable,
  createWaitingObservable,
} from './__fixtures__';
import {useObservable} from './useObservable';
import {Observable} from 'rxjs';

export default {
  title: 'react-observable/useObservable',
};

const ReadObservable: React.FC<{
  observable: Observable<unknown>;
}> = withSuspense()(
  withErrorBoundary()(({observable}) => {
    const state = useObservable(observable);
    return <RenderJSON value={state} />;
  }),
);

const loadingWhenWaitingObservable = createWaitingObservable();
export const LoadingWhenWaiting: React.FC = () => (
  <ReadObservable observable={loadingWhenWaitingObservable} />
);

const loadedWhenReceivedObservable = createReceivedObservable();
export const LoadedWhenReceived: React.FC = () => (
  <ReadObservable observable={loadedWhenReceivedObservable} />
);

const loadedWhenCompletedObservable = createCompletedObservable();
export const LoadedWhenCompleted: React.FC = () => (
  <ReadObservable observable={loadedWhenCompletedObservable} />
);

const erroredWhenErroredObservable = createErroredObservable();
export const ErroredWhenErrored: React.FC = () => (
  <ReadObservable observable={erroredWhenErroredObservable} />
);

const eventuallyLoadedObservable = createEventuallyCompletedObservable();
export const EventuallyLoaded: React.FC = () => (
  <ReadObservable observable={eventuallyLoadedObservable} />
);

const eventuallyErroredObservable = createEventuallyErroredObservable();
export const EventuallyErrored: React.FC = () => (
  <ReadObservable observable={eventuallyErroredObservable} />
);

const subscribedObservable = createReceivingObservable();
export const Subscribed: React.FC = () => (
  <ReadObservable observable={subscribedObservable} />
);
