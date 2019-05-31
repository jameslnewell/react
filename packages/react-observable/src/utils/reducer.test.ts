import {reducer} from './reducer';
import {Status} from '../types';
import {State} from './State';
import {reset, observing, observed, errored, completed} from './Action';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetState: State<any> = {
  status: undefined,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const observingState: State<any> = {
  status: Status.Waiting,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const observedState: State<any> = {
  status: Status.Receieved,
  error: undefined,
  value: {foo: 'bar'},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const completedState: State<any> = {
  status: Status.Completed,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const erroredState: State<any> = {
  status: Status.Errored,
  error: 'Uh oh!',
  value: undefined,
};

describe('reducer()', () => {
  it('should be in a reset state when reset', () => {
    expect(reducer(observingState, reset())).toEqual(resetState);
  });

  it('should be in a observing state when observing', () => {
    expect(reducer(resetState, observing())).toEqual(observingState);
  });

  it('should be in a observed state when observed', () => {
    expect(reducer(observingState, observed({foo: 'bar'}))).toEqual(
      observedState,
    );
  });

  it('should be in a completed state when completed', () => {
    expect(reducer(observingState, completed())).toEqual(completedState);
  });

  it('should be in an errored state when errored', () => {
    expect(reducer(observingState, errored('Uh oh!'))).toEqual(erroredState);
  });
});
