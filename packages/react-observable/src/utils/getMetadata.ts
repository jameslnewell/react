import {Status, Metadata} from '../types';
import {State} from './State';

export function getMetadata<T, E>(state: State<T, E>): Metadata<E> {
  return {
    status: state.status,
    error: state.error,
    isWaiting: state.status === Status.Waiting,
    isReceived: state.status === Status.Receieved,
    isCompleted: state.status === Status.Completed,
    isErrored: state.status === Status.Errored,
  };
}
