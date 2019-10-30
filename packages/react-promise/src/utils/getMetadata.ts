import {State} from './State';
import {Status, Metadata} from '../types';

export function getMetadata<T, E>(state: State<T, E>): Metadata<E> {
  return {
    status: state.status,
    error: state.error,
    isPending: state.status === Status.Pending,
    isFulfilled: state.status === Status.Fulfilled,
    isRejected: state.status === Status.Rejected,
  };
}
