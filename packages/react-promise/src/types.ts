export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface Factory<Parameters extends unknown[], Value> {
  (...params: Parameters): Promise<Value>;
}

export interface UnknownState {
  status: undefined;
  value: undefined;
  error: undefined;
  suspender: undefined;
}

export interface PendingState {
  status: Status.Pending;
  value: undefined;
  error: undefined;
  suspender: Promise<void>;
}

export interface FulfilledState<Value> {
  status: Status.Fulfilled;
  value: Value;
  error: undefined;
  suspender: Promise<void>;
}

export interface RejectedState {
  status: Status.Rejected;
  value: undefined;
  error: unknown;
  suspender: Promise<void>;
}

export type State<Value> =
  | UnknownState
  | PendingState
  | FulfilledState<Value>
  | RejectedState;
