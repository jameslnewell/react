import React, {useEffect} from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {render} from '@testing-library/react';
import useMounted from '.';

const AssertAfterMount: React.FC = () => {
  const mounted = useMounted();
  useEffect(() => {
    expect(mounted.current).toBeTruthy();
  });
  return null;
};
const AssertAfterUnmount: React.FC = () => {
  const mounted = useMounted();
  useEffect(() => {
    setTimeout(() => expect(mounted.current).toBeFalsy(), 1000);
  });
  return null;
};

describe('useMounted()', () => {
  it('should return true when mounted', () => {
    const {result} = renderHook(() => useMounted());
    expect(result.current.current).toBeTruthy();
  });

  it('should return false when unmounted', () => {
    const {result, unmount, rerender} = renderHook(() => useMounted());
    unmount();
    rerender();
    expect(result.current.current).toBeFalsy();
  });

  it('should return true when mounted', () => {
    expect.assertions(1);
    render(<AssertAfterMount />);
  });

  it('should return true when unmounted', () => {
    jest.useFakeTimers();
    expect.assertions(1);
    const {unmount} = render(<AssertAfterUnmount />);
    unmount();
    jest.runAllTimers();
  });
});
