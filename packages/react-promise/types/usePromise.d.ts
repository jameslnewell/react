import {Factory, Dependencies} from './types';
import {Output} from './utils/getOutput';
export declare function usePromise<T>(
  fn: Factory<T, []>,
  deps?: Dependencies,
): Output<T>;
