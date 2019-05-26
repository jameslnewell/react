import {State} from './State';
import {Status} from '../types';

export interface Output<T> extends State<T> {
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
}

export function getOutput<T>(state: State<T>): Output<T> {
  return {
    ...state,
    isPending: state.status === Status.Pending,
    isFulfilled: state.status === Status.Fulfilled,
    isRejected: state.status === Status.Rejected,
  };
}
