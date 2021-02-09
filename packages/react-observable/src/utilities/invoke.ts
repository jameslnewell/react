import {Factory, Status} from '../types';
import {Store, StoreKey} from '../Store';
import {
  firstValueFrom,
  Observable,
  Subscription,
} from '@jameslnewell/observable';

interface InvokeOptions<Parameters extends unknown[], Value> {
  store: Store;
  key: StoreKey;
  factory: Factory<Parameters, Value>;
  parameters: Parameters;
}

export function invoke<Parameters extends unknown[], Value>({
  store,
  key,
  factory,
  parameters,
}: InvokeOptions<Parameters, Value>): Observable<Value> {
  const observable: Observable<Value> = factory(...parameters);
  const suspender = firstValueFrom(observable);
  let subscription: Subscription;
  // eslint-disable-next-line prefer-const
  subscription = observable.subscribe({
    next: (value) => {
      // TODO: make more efficient to avoid arrary searching e.g. maybe fn inside setState returns prev state
      if (suspender === store.getState(key)?.suspender) {
        store.setState(key, {
          status: Status.Received,
          value,
          error: undefined,
          suspender,
        });
      } else {
        subscription?.unsubscribe();
      }
    },
    complete: () => {
      // TODO: make more efficient to avoid arrary searching e.g. maybe fn inside setState returns prev state
      if (suspender === store.getState(key)?.suspender) {
        store.setState(key, (prev) => ({
          status: Status.Completed,
          value: prev.value,
          error: undefined,
          suspender,
        }));
      } else {
        subscription?.unsubscribe();
      }
    },
    error: (error) => {
      // TODO: make more efficient to avoid arrary searching e.g. maybe fn inside setState returns prev state
      if (observable === store.getState(key)?.suspender) {
        store.setState(key, {
          status: Status.Errored,
          value: undefined,
          error,
          suspender,
        });
      } else {
        subscription?.unsubscribe();
      }
      throw error;
    },
  });
  store.setState(key, {
    status: Status.Waiting,
    value: undefined,
    error: undefined,
    suspender,
  });
  return observable;
}
