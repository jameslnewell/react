export enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface Factory<Parameters extends unknown[], Value> {
  (...parameters: Parameters): Promise<Value>;
}

export type State<Value> =
  | {
      status: undefined;
      value: undefined;
      error: undefined;
      isPending: false;
      isFulfilled: false;
      isRejected: false;
    }
  | {
      status: Status.Pending;
      value: undefined;
      error: undefined;
      isPending: true;
      isFulfilled: false;
      isRejected: false;
    }
  | {
      status: Status.Fulfilled;
      value: Value;
      error: undefined;
      isPending: false;
      isFulfilled: true;
      isRejected: false;
    }
  | {
      status: Status.Rejected;
      value: undefined;
      error: unknown;
      isPending: false;
      isFulfilled: false;
      isRejected: true;
    };
