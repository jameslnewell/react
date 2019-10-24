import {Observable, create} from '@jameslnewell/observable';

export enum ObservableType {
  None = 'none',
  Waiting = 'waiting',
  Recieved = 'received',
  Completed = 'completed',
  Errored = 'errored',
}

export function createObservable(
  type: ObservableType,
  delay: number,
): undefined | (() => Observable<number>) {
  if (type === ObservableType.None) {
    return undefined;
  }
  return () => {
    return create(subject => {
      switch (type) {
        case ObservableType.Waiting: {
          return;
        }
        case ObservableType.Completed: {
          subject.complete();
          return;
        }
        case ObservableType.Errored: {
          subject.error(new Error('Errored!'));
          return;
        }
        default: {
          let count = 0;
          const interval = setInterval(() => {
            subject.next(++count);
          }, delay);
          return () => clearInterval(interval);
        }
      }
    });
  };
}
