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
export declare type Action<T> =
  | ResetAction
  | ResolvingAction
  | ResolvedAction<T>
  | RejectedAction;
export declare function reset(): ResetAction;
export declare function resolving(): ResolvingAction;
export declare function resolved<T>(data: T | undefined): ResolvedAction<T>;
export declare function rejected(error: any | undefined): RejectedAction;
