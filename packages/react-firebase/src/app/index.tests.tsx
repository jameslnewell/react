import {getApp} from '@firebase/app';
import {renderHook} from '@testing-library/react-hooks';
import {useApp} from './index';
import {app} from '../__tests__/firebase';
import {wrapper} from '../__tests__/wrapper';

describe('app', () => {
  describe('useApp()', () => {
    test('returns the default app when not wrapped with a provider', () => {
      const {result} = renderHook(() => useApp());
      expect(result.current).toBe(getApp());
    });

    test('returns the provided app when wrapped with a provider', () => {
      const {result} = renderHook(() => useApp(), {
        wrapper: wrapper,
      });
      expect(result.current).toBe(app);
    });
  });
});
