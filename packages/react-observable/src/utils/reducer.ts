import {State} from './State';
import {Action} from './Action';
import {initialState} from './initialState';
import {Status} from '../types';

export function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'reset':
      return initialState;
    case Status.Waiting:
      return {
        status: Status.Waiting,
        value: undefined,
        error: undefined,
      };
    case Status.Receieved:
      return {
        status: Status.Receieved,
        value: action.data,
        error: undefined,
      };
    case Status.Completed:
      return {
        status: Status.Completed,
        value: state.value,
        error: undefined,
      };
    case Status.Errored:
      return {
        status: Status.Errored,
        value: undefined,
        error: action.error,
      };
    default:
      return state;
  }
}
