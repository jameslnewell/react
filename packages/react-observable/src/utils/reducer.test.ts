import {reducer} from './reducer';
import {Status} from '../types';
import {State} from './State';
import {reset, observing, observed, errored, completed} from './Action';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestState = State<any, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetState: TestState = {
  status: undefined,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const observingState: TestState = {
  status: Status.Waiting,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const observedState: TestState = {
  status: Status.Receieved,
  error: undefined,
  value: {foo: 'bar'},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const completedState: TestState = {
  status: Status.Completed,
  error: undefined,
  value: undefined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const erroredState: TestState = {
  status: Status.Errored,
  error: 'Uh oh!',
  value: undefined,
};

describe('reducer()', () => {
  test('should be in a reset state when reset', () => {
    expect(reducer(observingState, reset())).toEqual(resetState);
  });

  test('should be in a observing state when observing', () => {
    expect(reducer(resetState, observing())).toEqual(observingState);
  });

  test('should be in a observed state when observed', () => {
    expect(reducer(observingState, observed({foo: 'bar'}))).toEqual(
      observedState,
    );
  });

  test('should be in a completed state when completed', () => {
    expect(reducer(observingState, completed())).toEqual(completedState);
  });

  test('should be in an errored state when errored', () => {
    expect(reducer(observingState, errored('Uh oh!'))).toEqual(erroredState);
  });
});
