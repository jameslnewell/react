import {State} from './State';
import {Action} from './Action';
import {initialState} from './initialState';
import {Status} from '../types';

export function reducer<T, E>(
  state: State<T, E>,
  action: Action<T, E>,
): State<T, E> {
  switch (action.type) {
    case 'reset':
      return initialState;
    case Status.Pending:
      return {
        status: Status.Pending,
        value: undefined,
        error: undefined,
      };
    case Status.Fulfilled:
      return {
        status: Status.Fulfilled,
        value: action.data,
        error: undefined,
      };
    case Status.Rejected:
      return {
        status: Status.Rejected,
        value: undefined,
        error: action.error,
      };
    default:
      return state;
  }
}
