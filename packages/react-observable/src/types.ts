import {DependencyList} from 'react';
import {Observable} from '@jameslnewell/observable';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Factory<T, P extends any[] = []> {
  (...args: P): Observable<T>;
}

export type Dependencies = DependencyList;

export enum Status {
  Waiting = 'waiting',
  Receieved = 'received',
  Completed = 'completed',
  Errored = 'errored',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Metadata<E = any> {
  status: Status | undefined;
  error: E | undefined;
  isWaiting: boolean;
  isReceived: boolean;
  isCompleted: boolean;
  isErrored: boolean;
}
