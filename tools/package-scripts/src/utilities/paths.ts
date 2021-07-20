import * as path from 'path';
import resolve from 'resolve';

export const toolDirectory = path.resolve(__dirname, '../..');
export const rootDirectory = path.resolve('.');
export const srcDirectory = path.resolve('src');
export const outDirectory = path.resolve('dist');

export function removeExtension(file: string): string {
  return path.join(path.dirname(file), path.basename(file, path.extname(file)));
}

/**
 * Gets the package directory for the entrypoint
 * @param entrypoint
 * @returns
 *
 * @example index.ts => .
 * @example auth.ts => auth
 * @example auth/index.ts => auth
 * @example auth/auth.ts => auth/auth
 */
function getRelativePackageDirectory(entrypoint: string): string {
  let relativeDirectory = removeExtension(entrypoint);
  if (path.basename(relativeDirectory) === 'index') {
    relativeDirectory = path.dirname(relativeDirectory);
  }
  return relativeDirectory;
}

/**
 * Gets the source file path for the entrypoint
 * @param entrypoint
 * @returns
 */
export function getSourceFile(entrypoint: string): string {
  return resolve.sync(`./${entrypoint}`, {
    basedir: srcDirectory,
    extensions: ['.ts', '.tsx', '.js'],
  });
}

/**
 * Get the "main" file path for entrypoint's package
 * @param entrypoint
 */
export function getMainFile(entrypoint: string): string {
  let relativeMainFile = getRelativePackageDirectory(entrypoint);
  if (relativeMainFile === '.') {
    relativeMainFile = 'index';
  }
  return path.join(
    outDirectory,
    `${relativeMainFile.replace(/\/|\\/g, '-')}.cjs`,
  );
}

/**
 * Get the "module" file path for entrypoint's package
 * @param entrypoint
 */
export function getModuleFile(entrypoint: string): string {
  let relativeModuleFile = getRelativePackageDirectory(entrypoint);
  if (relativeModuleFile === '.') {
    relativeModuleFile = 'index';
  }
  return path.join(
    outDirectory,
    `${relativeModuleFile.replace(/\/|\\/g, '-')}.mjs`,
  );
}

/**
 * Gets the .d.ts file path for the entrypoint
 * @param entrypoint
 * @returns
 */
export function getTypeFile(entrypoint: string): string {
  const mainFile = getMainFile(entrypoint);
  return mainFile.replace(/\.cjs$/, '.d.ts');
}

/**
 * Gets the package.json file path for the entrypoint
 * @param entrypoint
 * @returns
 */
export function getPackageFile(entrypoint: string): string {
  const relativePackageDirectory = getRelativePackageDirectory(entrypoint);
  return path.join(rootDirectory, relativePackageDirectory, 'package.json');
}
