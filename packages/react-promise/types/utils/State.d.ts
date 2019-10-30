import {Status} from '../types';
export interface State<T> {
  status: Status | undefined;
  error: any | undefined;
  value: T | undefined;
}
