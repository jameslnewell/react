import {Status} from '../types';
import {State} from './State';

export interface Output<T> extends State<T> {
  isWaiting: boolean;
  isReceived: boolean;
  isCompleted: boolean;
  isErrored: boolean;
}

export function getOutput<T>(state: State<T>): Output<T> {
  return {
    ...state,
    isWaiting: state.status === Status.Waiting,
    isReceived: state.status === Status.Receieved,
    isCompleted: state.status === Status.Completed,
    isErrored: state.status === Status.Errored,
  };
}
