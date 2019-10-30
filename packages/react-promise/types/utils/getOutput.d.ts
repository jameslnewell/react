import {State} from './State';
export interface Output<T> extends State<T> {
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
}
export declare function getOutput<T>(state: State<T>): Output<T>;
