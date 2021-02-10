import {fromArray} from '@jameslnewell/observable';
import {fromError} from '@jameslnewell/observable';
import {create, delay, Observable} from '@jameslnewell/observable';
import React from 'react';
import {
  CompletedState,
  WaitingState,
  ReceivedState,
  ErroredState,
  Status,
  UnknownState,
} from '../types';

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
  status: Status.Received,
  value,
  error: undefined,
};

export const completedState: CompletedState<typeof value> = {
  status: Status.Completed,
  value,
  error: undefined,
};

export const erroredState: ErroredState = {
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

export function createEventuallyCompletedObservable(): Observable<
  unknown,
  unknown
> {
  return delay(3000)(fromArray([value]));
}

export function createEventuallyErroredObservable(): Observable<
  unknown,
  unknown
> {
  return delay(3000)(fromError(error));
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
