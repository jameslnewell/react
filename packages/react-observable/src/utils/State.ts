import {Status} from '../types';

export interface State<T, E> {
  status: Status | undefined;
  value: T | undefined;
  error: E | undefined;
}
