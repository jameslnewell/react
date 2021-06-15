import {Observable, Subject, firstValueFrom} from 'rxjs';
import {useState, useEffect} from 'react';
import {ErroredState, LoadedState, LoadingState, Status} from './types';
import {
  createErroredState,
  createLoadedState,
  createLoadingState,
} from './state';

const noop = (): void => {
  /* do nothing */
};

type ResourceState<Value> = LoadingState | LoadedState<Value> | ErroredState;

export interface ResourceObserver<Value = unknown> {
  (state: ResourceState<Value>): void;
}

export interface Resource<Value = unknown> {
  state(): ResourceState<Value>;
  read(): Value;
  subscribe(observer: ResourceObserver<Value>): () => void;
}

export function createResource<Value = unknown>(
  observable: Observable<Value>,
): Resource<Value> {
  let hasReceivedAValue = false;
  let state: ResourceState<Value> = createLoadingState();

  const subject = new Subject<ResourceState<Value>>();
  const suspender = firstValueFrom(subject, {defaultValue: undefined}).then(
    noop,
    noop,
  );
  const subscription = observable.subscribe({
    next(value) {
      hasReceivedAValue = true;
      state = createLoadedState(value);
      subject.next(state);
    },
    complete() {
      if (!hasReceivedAValue) {
        state = createErroredState(
          new Error('Observable completed without a value.'),
        );
        subject.next(state);
      }
      subject.complete();
    },
    error(error) {
      state = createErroredState(error);
      subject.next(state);
      subject.complete();
    },
  });

  return {
    state() {
      return state;
    },

    read() {
      switch (state.status) {
        case Status.Loading:
          throw suspender;
        case Status.Loaded:
          return state.value;
        case Status.Errored:
          throw state.error;
      }
    },

    subscribe(observer) {
      const observerSubscription = subject.subscribe({
        next() {
          observer(state);
        },
        complete() {
          observer(state);
        },
        error() {
          observer(state);
        },
      });
      return () => {
        observerSubscription.unsubscribe();
        if (subject.observed) {
          setTimeout(() => {
            if (subject.observed) {
              subscription?.unsubscribe();
            }
          }, 0);
        }
      };
    },
  };
}

export function useResource<Value>(resource: Resource<Value>): Value {
  const [, setState] = useState<ResourceState<Value>>(() => resource.state());
  useEffect(
    () => resource.subscribe((state) => setState(state)),
    [resource, setState],
  );
  return resource.read();
}

export function useResourceState<Value>(
  resource: Resource<Value>,
): ResourceState<Value> {
  const [, setState] = useState<ResourceState<Value>>(() => resource?.state());
  useEffect(
    () => resource.subscribe((state) => setState(state)),
    [resource, setState],
  );
  return resource.state();
}
