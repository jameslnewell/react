export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface Factory<Parameters extends unknown[] = [], Value = unknown> {
  (...params: Parameters): Promise<Value>;
}

export interface InvokeFunction<Parameters extends unknown[] = []> {
  (...params: Parameters): void;
}

export interface InvokeAsyncFunction<
  Parameters extends unknown[] = [],
  Value = unknown
> {
  (...params: Parameters): Promise<Value>;
}

export interface Result<
  Parameters extends unknown[] = [],
  Value = unknown,
  Error = unknown
> {
  status: Status | undefined;
  value?: Value;
  error?: Error;
  invoke: InvokeFunction<Parameters>;
  invokeAsync: InvokeAsyncFunction<Parameters, Value>;
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
}
