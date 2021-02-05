import {ImportsNotUsedAsValues} from 'typescript';

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

export interface PendingState<Value> {
  status: Status.Pending;
  value: undefined;
  error: undefined;
  suspender: Promise<Value>;
}

export interface FulfilledState<Value> {
  status: Status.Fulfilled;
  value: Value;
  error: undefined;
  suspender: Promise<Value>;
}

export interface RejectedState<Value> {
  status: Status.Rejected;
  value: undefined;
  error: unknown;
  suspender: Promise<Value>;
}

export type State<Value> =
  | UnknownState
  | PendingState<Value>
  | FulfilledState<Value>
  | RejectedState<Value>;
