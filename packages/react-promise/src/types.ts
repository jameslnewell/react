import {DependencyList} from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Factory<T, P extends any[] = []> {
  (...args: P): Promise<T>;
}

export type Dependencies = DependencyList;

export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Metadata<E = any> {
  status: Status | undefined;
  error?: E;
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
}
