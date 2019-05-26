import {reducer} from './reducer';
import {Status} from '../types';
import {reset, resolving, resolved, rejected} from './Action';

const resetState = {
  status: undefined,
  error: undefined,
  data: undefined,
};

const resolvingState = {
  status: Status.Pending,
  error: undefined,
  data: undefined,
};

const resolvedState = {
  status: Status.Fulfilled,
  error: undefined,
  data: {foo: 'bar'},
};

const rejectedState = {
  status: Status.Rejected,
  error: 'Uh oh!',
  data: undefined,
};

describe('reducer()', () => {
  it('should be in a reset state when reset', () => {
    expect(reducer(resolvingState, reset())).toEqual(resetState);
  });

  it('should be in a resolving state when resolving', () => {
    expect(reducer(resetState, resolving())).toEqual(resolvingState);
  });

  it('should be in a resolved state when resolved', () => {
    expect(reducer(resolvingState, resolved({foo: 'bar'}))).toEqual(
      resolvedState,
    );
  });

  it('should be in an rejected state when rejected', () => {
    expect(reducer(resolvingState, rejected('Uh oh!'))).toEqual(rejectedState);
  });
});
