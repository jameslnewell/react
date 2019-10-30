import {Status} from '../types';

export interface ResetAction {
  type: 'reset';
}

export interface PendingAction {
  type: Status.Pending;
}

export interface FulfilledAction<T> {
  type: Status.Fulfilled;
  data: T | undefined;
}

export interface RejectedAction<E> {
  type: Status.Rejected;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: E | undefined;
}

export type Action<T, E> =
  | ResetAction
  | PendingAction
  | FulfilledAction<T>
  | RejectedAction<E>;

export function reset(): ResetAction {
  return {type: 'reset'};
}

export function pending(): PendingAction {
  return {type: Status.Pending};
}

export function fulfilled<T>(data: T | undefined): FulfilledAction<T> {
  return {type: Status.Fulfilled, data};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rejected<E>(error: E | undefined): RejectedAction<E> {
  return {type: Status.Rejected, error};
}
