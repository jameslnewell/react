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
  factory: (() => Observable<unknown>) | undefined;
  deps: unknown[];
}> = withSuspense()(
  withErrorBoundary()(({factory, deps}) => {
    const {invoke, ...state} = useInvokableObservable(factory, deps);
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
  <ReadObservable factory={loadingWhenWaitingObservable} deps={[]} />
);

const loadedWhenReceivedObservable = (): Observable<unknown> =>
  createReceivedObservable();
export const LoadedWhenReceived: React.FC = () => (
  <ReadObservable factory={loadedWhenReceivedObservable} deps={[]} />
);

const loadedWhenCompletedObservable = (): Observable<unknown> =>
  createCompletedObservable();
export const LoadedWhenCompleted: React.FC = () => (
  <ReadObservable factory={loadedWhenCompletedObservable} deps={[]} />
);

const erroredWhenErroredObservable = (): Observable<unknown> =>
  createErroredObservable();
export const ErriredWhenErrored: React.FC = () => (
  <ReadObservable factory={erroredWhenErroredObservable} deps={[]} />
);

const eventuallyLoadedWhenReceivedObservable = (): Observable<unknown> =>
  createEventuallyCompletedObservable();
export const EventuallyLoadedWhenReceived: React.FC = () => (
  <ReadObservable factory={eventuallyLoadedWhenReceivedObservable} deps={[]} />
);

const eventuallyErroredObservable = (): Observable<unknown> =>
  createEventuallyErroredObservable();
export const EventuallyErroredWhenErrored: React.FC = () => (
  <ReadObservable factory={eventuallyErroredObservable} deps={[]} />
);

const subscribedObservable = (): Observable<unknown> =>
  createReceivingObservable();
export const Subscribed: React.FC = () => (
  <ReadObservable factory={subscribedObservable} deps={[]} />
);
