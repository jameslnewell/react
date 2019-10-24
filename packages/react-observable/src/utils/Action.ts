import {Status} from '../types';

export interface ResetAction {
  type: 'reset';
}

export interface ObservingAction {
  type: Status.Waiting;
}

export interface ObservedAction<T> {
  type: Status.Receieved;
  data: T | undefined;
}

export interface CompletedAction {
  type: Status.Completed;
}

export interface ErroredAction<E> {
  type: Status.Errored;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: E | undefined;
}

export type Action<T, E> =
  | ResetAction
  | ObservingAction
  | ObservedAction<T>
  | CompletedAction
  | ErroredAction<E>;

export function reset(): ResetAction {
  return {type: 'reset'};
}

export function observing(): ObservingAction {
  return {type: Status.Waiting};
}

export function observed<T>(data: T | undefined): ObservedAction<T> {
  return {type: Status.Receieved, data};
}

export function completed(): CompletedAction {
  return {type: Status.Completed};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errored<E>(error: E | undefined): ErroredAction<E> {
  return {type: Status.Errored, error};
}
