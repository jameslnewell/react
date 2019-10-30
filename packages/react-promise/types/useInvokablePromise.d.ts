import {Dependencies, Factory} from './types';
import {Output} from './utils/getOutput';
export declare function useInvokablePromise<T, P extends any[]>(
  fn: Factory<T, P>,
  deps?: Dependencies,
): Output<T> & {
  invoke: (...args: P) => Promise<void>;
};
