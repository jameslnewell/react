import {State} from './State';
import {Status} from '../types';

export interface Metadata<E> {
  status: Status | undefined;
  error?: E;
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
}

export function getMetadata<T, E>(state: State<T, E>): Metadata<E> {
  return {
    status: state.status,
    error: state.error,
    isPending: state.status === Status.Pending,
    isFulfilled: state.status === Status.Fulfilled,
    isRejected: state.status === Status.Rejected,
  };
}
