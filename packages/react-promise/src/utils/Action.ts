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

export interface RejectedAction {
  type: Status.Rejected;
  error: any | undefined;
}

export type Action<T> =
  | ResetAction
  | ResolvingAction
  | ResolvedAction<T>
  | RejectedAction;

export function reset(): ResetAction {
  return {type: 'reset'};
}

export function resolving(): ResolvingAction {
  return {type: Status.Pending};
}

export function resolved<T>(data: T | undefined): ResolvedAction<T> {
  return {type: Status.Fulfilled, data};
}

export function rejected(error: any | undefined): RejectedAction {
  return {type: Status.Rejected, error};
}
