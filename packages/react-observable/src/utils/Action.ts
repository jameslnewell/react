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

export interface ErroredAction {
  type: Status.Errored;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any | undefined;
}

export type Action<T> =
  | ResetAction
  | ObservingAction
  | ObservedAction<T>
  | CompletedAction
  | ErroredAction;

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
export function errored(error: any | undefined): ErroredAction {
  return {type: Status.Errored, error};
}
