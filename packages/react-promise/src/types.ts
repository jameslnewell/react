export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface Factory<Parameters extends unknown[], Value> {
  (...parameters: Parameters): Promise<Value>;
}

export interface UnknownState {
  status: undefined;
  value: undefined;
  error: undefined;
}

export interface PendingState {
  status: Status.Pending;
  value: undefined;
  error: undefined;
}

export interface FulfilledState<Value> {
  status: Status.Fulfilled;
  value: Value;
  error: undefined;
}

export interface RejectedState {
  status: Status.Rejected;
  value: undefined;
  error: unknown;
}

export type State<Value> =
  | UnknownState
  | PendingState
  | FulfilledState<Value>
  | RejectedState;
