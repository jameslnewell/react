import * as path from 'path';
import {
  getMainFile,
  getTypeFile,
  getModuleFile,
  getPackageFile,
  rootDirectory,
} from './paths';

describe('getMainFile()', () => {
  test('"index.ts" => "dist/index.cjs"', () => {
    expect(path.relative(rootDirectory, getMainFile('index.ts'))).toEqual(
      'dist/index.cjs',
    );
  });

  test('"auth.ts" => "dist/auth.cjs"', () => {
    expect(path.relative(rootDirectory, getMainFile('auth.ts'))).toEqual(
      'dist/auth.cjs',
    );
  });

  test('"auth/index.ts" => "dist/auth.cjs"', () => {
    expect(path.relative(rootDirectory, getMainFile('auth/index.ts'))).toEqual(
      'dist/auth.cjs',
    );
  });

  test('"auth/auth.ts" => "dist/auth-auth.cjs"', () => {
    expect(path.relative(rootDirectory, getMainFile('auth/auth.ts'))).toEqual(
      'dist/auth-auth.cjs',
    );
  });
});

describe('getModuleFile()', () => {
  test('"index.ts" => "dist/index.mjs"', () => {
    expect(path.relative(rootDirectory, getModuleFile('index.ts'))).toEqual(
      'dist/index.mjs',
    );
  });

  test('"auth.ts" => "dist/auth.mjs"', () => {
    expect(path.relative(rootDirectory, getModuleFile('auth.ts'))).toEqual(
      'dist/auth.mjs',
    );
  });

  test('"auth/index.ts" => "dist/auth.mjs"', () => {
    expect(
      path.relative(rootDirectory, getModuleFile('auth/index.ts')),
    ).toEqual('dist/auth.mjs');
  });

  test('"auth/auth.ts" => "dist/auth-auth.mjs"', () => {
    expect(path.relative(rootDirectory, getModuleFile('auth/auth.ts'))).toEqual(
      'dist/auth-auth.mjs',
    );
  });
});

describe('getTypeFile()', () => {
  test('"index.ts" => "dist/index.d.ts"', () => {
    expect(path.relative(rootDirectory, getTypeFile('index.ts'))).toEqual(
      'dist/index.d.ts',
    );
  });

  test('"auth.ts" => "dist/auth.d.ts"', () => {
    expect(path.relative(rootDirectory, getTypeFile('auth.ts'))).toEqual(
      'dist/auth.d.ts',
    );
  });

  test('"auth/index.ts" => "dist/auth.d.ts"', () => {
    expect(path.relative(rootDirectory, getTypeFile('auth/index.ts'))).toEqual(
      'dist/auth.d.ts',
    );
  });

  test('"auth/auth.ts" => "dist/auth-auth.d.ts"', () => {
    expect(path.relative(rootDirectory, getTypeFile('auth/auth.ts'))).toEqual(
      'dist/auth-auth.d.ts',
    );
  });
});

describe('getPackageFile()', () => {
  test('"index.ts" => "package.json"', () => {
    expect(path.relative(rootDirectory, getPackageFile('index.ts'))).toEqual(
      'package.json',
    );
  });
  test('"auth.ts" => "auth/package.json"', () => {
    expect(path.relative(rootDirectory, getPackageFile('auth.ts'))).toEqual(
      'auth/package.json',
    );
  });
  test('"auth/index.ts" => "auth/package.json"', () => {
    expect(
      path.relative(rootDirectory, getPackageFile('auth/index.ts')),
    ).toEqual('auth/package.json');
  });
  test('"auth/auth.ts" => "auth/auth/package.json"', () => {
    expect(
      path.relative(rootDirectory, getPackageFile('auth/auth.ts')),
    ).toEqual('auth/auth/package.json');
  });
});
