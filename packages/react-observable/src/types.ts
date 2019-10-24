import {DependencyList} from 'react';
import {Observable} from '@jameslnewell/observable';

export enum Status {
  Waiting = 'waiting',
  Receieved = 'received',
  Completed = 'completed',
  Errored = 'errored',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Factory<T, P extends any[] = []> {
  (...args: P): Observable<T>;
}

export type Dependencies = DependencyList;
