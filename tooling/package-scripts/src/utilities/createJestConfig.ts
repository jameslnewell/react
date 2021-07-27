import {createBabelConfigForJest} from './createBabelConfig';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export function createJestConfig() {
  return {
    testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],
    transform: {
      '\\.[jt]sx?$': [
        require.resolve('babel-jest'),
        createBabelConfigForJest(),
      ],
    },
    testEnvironment: 'jsdom',
  };
}
