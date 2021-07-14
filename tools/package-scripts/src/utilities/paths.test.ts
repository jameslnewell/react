import {getPackageDirectory} from './paths';

describe('getPackageDirectory()', () => {
  test('index.ts', () => {
    expect(getPackageDirectory('index.ts')).toEqual('.');
  });
  test('auth.ts', () => {
    expect(getPackageDirectory('auth.ts')).toEqual('auth');
  });
  test('auth/index.ts', () => {
    expect(getPackageDirectory('auth/index.ts')).toEqual('auth');
  });
  test('auth/auth.ts', () => {
    expect(getPackageDirectory('auth/auth.ts')).toEqual('auth/auth');
  });
});
