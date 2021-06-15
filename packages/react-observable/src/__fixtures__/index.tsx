/* eslint-disable @typescript-eslint/ban-types */
import * as rxjs from 'rxjs';
import {delay, materialize, dematerialize} from 'rxjs/operators';

export const value = 'Hello World!';
export const error = 'Uh oh!';

export const noop = (): void => {
  /* do nothing */
};

export function createWaitingObservable(): rxjs.Observable<never> {
  return new rxjs.Observable(() => {
    /* do nothing */
  });
}

export function createReceivedObservable(): rxjs.Observable<string> {
  return rxjs.of(value);
}

export function createCompletedObservable(): rxjs.Observable<string> {
  return rxjs.of(value);
}

export function createErroredObservable(): rxjs.Observable<never> {
  return rxjs.throwError(() => error);
}

export function createEventuallyCompletedObservable(): rxjs.Observable<string> {
  return rxjs.of(value).pipe(delay(3000));
}

export function createEventuallyErroredObservable(): rxjs.Observable<unknown> {
  return rxjs
    .throwError(() => error)
    .pipe(materialize(), delay(3000), dematerialize());
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function createReceivingObservable(): rxjs.Observable<number> {
  return rxjs.interval(500);
}
