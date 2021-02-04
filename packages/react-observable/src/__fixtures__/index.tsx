import {fromArray} from '@jameslnewell/observable';
import {create, delay, Observable} from '@jameslnewell/observable';
import React from 'react';
import {
  CompletedState,
  WaitingState,
  ReceivedState,
  ErroredState,
  Status,
  UnknownState,
} from '../Resource';

export const value = 'Hello World!';
export const error = 'Uh oh!';

export const unknownState: UnknownState = {
  status: undefined,
  value: undefined,
  error: undefined,
};

export const waitingState: WaitingState = {
  status: Status.Waiting,
  value: undefined,
  error: undefined,
};

export const receivedState: ReceivedState<typeof value> = {
  status: Status.Receieved,
  value,
  error: undefined,
};

export const completedState: CompletedState<typeof value> = {
  status: Status.Completed,
  value,
  error: undefined,
};

export const erroredState: ErroredState<typeof error> = {
  status: Status.Errored,
  value: undefined,
  error,
};

export const noop = (): void => {
  /* do nothing */
};

export function createWaitingObservable(): Observable<unknown> {
  return create(noop);
}

export function createReceivedObservable(): Observable<unknown> {
  return create((observer) => observer.next(value));
}

export function createCompletedObservable(): Observable<unknown> {
  return create((observer) => {
    observer.next(value);
    observer.complete();
  });
}

export function createErroredObservable(): Observable<unknown> {
  return create((observer) => observer.error(error));
}

export function createEventuallyFulfilledObservable(
  ms = 3000,
): Observable<unknown, unknown> {
  return delay(ms)(fromArray([1, 2, 3]));
}

export function createEventuallyRejectedPromise(
  ms = 3000,
): Observable<unknown, unknown> {
  return delay(ms)(fromArray([1, 2, 3]));
}

export const Fallback: React.FC = () => {
  return <p>Loading...</p>;
};

export interface RenderJSONProps {
  value: unknown;
}

export const RenderJSON: React.FC<RenderJSONProps> = ({value}) => {
  return (
    <code>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </code>
  );
};
