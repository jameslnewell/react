import {renderHook} from '@testing-library/react-hooks';
import {useMounted} from './useMounted';

describe('useMounted()', () => {
  it('should return true when mounted', () => {
    const {result} = renderHook(() => useMounted());
    expect(result.current.current).toBeTruthy();
  });

  it('should return false when mounted', () => {
    const {result, unmount} = renderHook(() => useMounted());
    unmount();
    expect(result.current.current).toBeFalsy();
  });
});
