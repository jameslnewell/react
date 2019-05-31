import {Observable, Subject} from 'rxjs';

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
): Observable<number> | undefined {
  if (type === ObservableType.None) {
    return undefined;
  }
  return Observable.create((subject: Subject<number>) => {
    switch (type) {
      case ObservableType.Waiting:
        return;
      case ObservableType.Completed:
        subject.complete();
        return;
      case ObservableType.Errored:
        subject.error(new Error('Errored!'));
        return;
    }
    let count = 0;
    const interval = setInterval(() => {
      subject.next(++count);
    }, delay);
    return () => clearInterval(interval);
  });
}
