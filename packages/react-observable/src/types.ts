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
  isWaiting: false;
  isReceived: false;
  isCompleted: false;
  isErrored: false;
}

export interface WaitingState {
  status: Status.Waiting;
  value: undefined;
  error: undefined;
  isWaiting: true;
  isReceived: false;
  isCompleted: false;
  isErrored: false;
}

export interface ReceivedState<Value> {
  status: Status.Received;
  value: Value;
  error: undefined;
  isWaiting: false;
  isReceived: true;
  isCompleted: false;
  isErrored: false;
}

export interface CompletedState<Value> {
  status: Status.Completed;
  value: Value;
  error: undefined;
  isWaiting: false;
  isReceived: false;
  isCompleted: true;
  isErrored: false;
}

export interface ErroredState {
  status: Status.Errored;
  value: undefined;
  error: unknown;
  isWaiting: false;
  isReceived: false;
  isCompleted: false;
  isErrored: true;
}

export type State<Value> =
  | UnknownState
  | WaitingState
  | ReceivedState<Value>
  | CompletedState<Value>
  | ErroredState;
