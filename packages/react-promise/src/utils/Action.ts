import {Status} from '../types';

export interface ResetAction {
  type: 'reset';
}

export interface ResolvingAction {
  type: Status.Pending;
}

export interface ResolvedAction<T> {
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
  | ResolvingAction
  | ResolvedAction<T>
  | RejectedAction<E>;

export function reset(): ResetAction {
  return {type: 'reset'};
}

export function resolving(): ResolvingAction {
  return {type: Status.Pending};
}

export function resolved<T>(data: T | undefined): ResolvedAction<T> {
  return {type: Status.Fulfilled, data};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rejected<E>(error: E | undefined): RejectedAction<E> {
  return {type: Status.Rejected, error};
}
