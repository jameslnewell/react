import {DependencyList} from 'react';

export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Factory<T, P extends any[] = []> {
  (...args: P): Promise<T> | undefined;
}

export type Dependencies = DependencyList;
