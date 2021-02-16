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
  isPending: false;
  isFulfilled: false;
  isRejected: false;
}

export interface PendingState {
  status: Status.Pending;
  value: undefined;
  error: undefined;
  isPending: true;
  isFulfilled: false;
  isRejected: false;
}

export interface FulfilledState<Value> {
  status: Status.Fulfilled;
  value: Value;
  error: undefined;
  isPending: false;
  isFulfilled: true;
  isRejected: false;
}

export interface RejectedState {
  status: Status.Rejected;
  value: undefined;
  error: unknown;
  isPending: false;
  isFulfilled: false;
  isRejected: true;
}

export type State<Value> =
  | UnknownState
  | PendingState
  | FulfilledState<Value>
  | RejectedState;
