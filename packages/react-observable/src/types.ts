import {Observable} from '@jameslnewell/observable';

export enum Status {
  Waiting = 'waiting',
  Received = 'received',
  Completed = 'completed',
  Errored = 'errored',
}

export interface Factory<Parameters extends unknown[], Value> {
  (...params: Parameters): Observable<Value>;
}

export interface UnknownState {
  status: undefined;
  value: undefined;
  error: undefined;
}

export interface WaitingState {
  status: Status.Waiting;
  value: undefined;
  error: undefined;
}

export interface ReceivedState<Value> {
  status: Status.Received;
  value: Value;
  error: undefined;
}

export interface CompletedState<Value> {
  status: Status.Completed;
  value: Value;
  error: undefined;
}

export interface ErroredState {
  status: Status.Errored;
  value: undefined;
  error: unknown;
}

export type State<Value> =
  | UnknownState
  | WaitingState
  | ReceivedState<Value>
  | CompletedState<Value>
  | ErroredState;
