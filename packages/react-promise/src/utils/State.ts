import {Status} from '../types';

export interface State<T, E> {
  status: Status | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: E | undefined;
  value: T | undefined;
}
