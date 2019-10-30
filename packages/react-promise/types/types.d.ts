import {DependencyList} from 'react';
export declare enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}
export interface Factory<T, P extends any[] = []> {
  (...args: P): Promise<T> | undefined;
}
export declare type Dependencies = DependencyList;
