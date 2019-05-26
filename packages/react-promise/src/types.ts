import {DependencyList} from 'react';

export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface Factory<T> {
  (): Promise<T> | undefined;
}

export type Dependencies = DependencyList;
