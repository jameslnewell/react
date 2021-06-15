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
import {useInvokableObservable} from './useInvokableObservable';
import {Observable} from 'rxjs';

export default {
  title: 'react-observable/useInvokableObservable',
};

const ReadObservable: React.FC<{
  factory: () => Observable<unknown>;
}> = withSuspense()(
  withErrorBoundary()(({factory}) => {
    const [invoke, state] = useInvokableObservable(factory);
    return (
      <>
        <button onClick={invoke}>Invoke</button>
        <RenderJSON value={state} />
      </>
    );
  }),
);

const loadingWhenWaitingObservable = (): Observable<unknown> =>
  createWaitingObservable();
export const LoadingWhenWaiting: React.FC = () => (
  <ReadObservable factory={loadingWhenWaitingObservable} />
);

const loadedWhenReceivedObservable = (): Observable<unknown> =>
  createReceivedObservable();
export const LoadedWhenReceived: React.FC = () => (
  <ReadObservable factory={loadedWhenReceivedObservable} />
);

const loadedWhenCompletedObservable = (): Observable<unknown> =>
  createCompletedObservable();
export const LoadedWhenCompleted: React.FC = () => (
  <ReadObservable factory={loadedWhenCompletedObservable} />
);

const erroredWhenErroredObservable = (): Observable<unknown> =>
  createErroredObservable();
export const ErriredWhenErrored: React.FC = () => (
  <ReadObservable factory={erroredWhenErroredObservable} />
);

const eventuallyLoadedObservable = (): Observable<unknown> =>
  createEventuallyCompletedObservable();
export const EventuallyLoaded: React.FC = () => (
  <ReadObservable factory={eventuallyLoadedObservable} />
);

const eventuallyErroredObservable = (): Observable<unknown> =>
  createEventuallyErroredObservable();
export const EventuallyErrored: React.FC = () => (
  <ReadObservable factory={eventuallyErroredObservable} />
);

const subscribedObservable = (): Observable<unknown> =>
  createReceivingObservable();
export const Subscribed: React.FC = () => (
  <ReadObservable factory={subscribedObservable} />
);
