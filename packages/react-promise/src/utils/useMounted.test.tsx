import {renderHook} from 'react-hooks-testing-library';
import {useMounted} from './useMounted';

describe('useMounted()', () => {
  // https://github.com/mpeyper/react-hooks-testing-library/issues/76
  let globalUnmount: (() => void) | undefined;
  afterEach(() => {
    if (globalUnmount) {
      globalUnmount();
      globalUnmount;
    }
  });

  function runHook<P, R>(callback: (props: P) => R) {
    const ret = renderHook(callback);
    globalUnmount = ret.unmount;
    return ret;
  }

  it('should return true when mounted', () => {
    const {result} = runHook(() => useMounted());
    expect(result.current.current).toBeTruthy();
  });

  it('should return false when mounted', () => {
    const {result, unmount} = runHook(() => useMounted());
    unmount();
    expect(result.current.current).toBeFalsy();
  });
});
