import {Dispatch, RefObject} from 'react';
import {Action} from './Action';
export declare function track<T>(
  promise: Promise<T>,
  dispatch: Dispatch<Action<T>>,
  isMounted: RefObject<boolean>,
): Promise<void>;
