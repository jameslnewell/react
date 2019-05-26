import {isPromise} from './isPromise';

describe('isPromise()', () => {
  it('should return false for undefined', () => {
    expect(isPromise(undefined)).toEqual(false);
  });

  it('should be in a resolving state when resolving', () => {
    expect(isPromise(Promise.resolve())).toEqual(true);
  });

  it('should be in a resolving state when resolving', () => {
    expect(isPromise(Promise.reject())).toEqual(true);
  });
});
