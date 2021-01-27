export enum CreateResourceStatus {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

export interface CreateResourceFactoryFunction<
  Value = unknown,
  Parameters extends unknown[] = []
> {
  (...params: Parameters): Promise<Value>;
}

export interface CreateResourceResult<
  Value = unknown,
  Parameters extends unknown[] = []
> {
  /**
   * The resource status
   */
  status: CreateResourceStatus | undefined;

  /**
   * The resource value
   */
  value: Value | undefined;

  /**
   * The resource error
   */
  error: unknown | undefined;

  /**
   * Call in the consuming component to access the value, suspend or throw
   * @param params
   */
  read(...params: Parameters): Value;

  /**
   * Call in the consuming component after the resource has loaded to start it loading again
   * @param params
   */
  reload(...params: Parameters): void;

  /**
   * Call before the consuming component is mounted to start loading the resource if it hasn't already been loaded
   * @param params
   */
  preload(...params: Parameters): void;
}

function areArraysEqualShallow(a: Array<unknown>, b: Array<unknown>): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function createResource<
  Value = unknown,
  Parameters extends unknown[] = []
>(
  fn: CreateResourceFactoryFunction<Value, Parameters>,
): CreateResourceResult<Value, Parameters> {
  let status: CreateResourceStatus | undefined = undefined;
  let value: Value | undefined = undefined;
  let error: unknown | undefined = undefined;
  let promise: Promise<void> | undefined = undefined;
  let prevParams: unknown[] = [];

  const invoke = async (...params: Parameters): Promise<void> => {
    status = CreateResourceStatus.Pending;
    value = undefined;
    error = undefined;
    const scopedPromise = (promise = fn(...params).then(
      (v) => {
        // check the scoped promise is still the current promise
        if (scopedPromise !== promise) {
          return;
        }
        status = CreateResourceStatus.Fulfilled;
        value = v;
        error = undefined;
      },
      (e) => {
        // check the scoped promise is still the current promise
        if (scopedPromise !== promise) {
          return;
        }
        status = CreateResourceStatus.Rejected;
        value = undefined;
        error = e;
      },
    ));
    prevParams = params;
  };

  const invokeIfNotAlreadyInvoked = async (
    ...params: Parameters
  ): Promise<void> => {
    if (areArraysEqualShallow(params, prevParams)) {
      if (!promise) {
        await invoke(...params);
      }
    } else {
      await invoke(...params);
    }
  };

  return {
    get status() {
      return status;
    },

    get value() {
      return value;
    },

    get error() {
      return error;
    },

    read(...params) {
      invokeIfNotAlreadyInvoked(...params);

      if (status === CreateResourceStatus.Rejected) {
        throw error;
      }

      if (status === CreateResourceStatus.Fulfilled) {
        return value!;
      }

      throw promise;
    },

    preload(...params) {
      invokeIfNotAlreadyInvoked(...params);
    },

    reload(...params) {
      invoke(...params);
    },
  };
}
