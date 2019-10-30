import {reducer} from './reducer';
import {Status} from '../types';
import {State} from './State';
import {reset, resolving, resolved, rejected} from './Action';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetState: State<any, any> = {
  status: undefined,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolvingState: State<any, any> = {
  status: Status.Pending,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolvedState: State<any, any> = {
  status: Status.Fulfilled,
  error: undefined,
  value: {foo: 'bar'},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rejectedState: State<any, any> = {
  status: Status.Rejected,
  error: 'Uh oh!',
  value: undefined,
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
