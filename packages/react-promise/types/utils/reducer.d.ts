import {State} from './State';
import {Action} from './Action';
export declare function reducer<T>(
  state: State<T>,
  action: Action<T>,
): State<T>;
