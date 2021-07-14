import * as path from 'path';
import {readJSONFile} from './readJSONFile';

export const toolDirectory = path.resolve(__dirname, '../..');
export const rootDirectory = path.resolve('.');
export const srcDirectory = path.resolve('src');
export const outDirectory = path.resolve('dist');

/**
 * Gets the source file path for the entrypoint
 * @param entrypoint
 * @returns
 */
export function getSourceFile(entrypoint: string): string {
  // TODO: use resolve lib with TS extensions
  return path.join(srcDirectory, entrypoint);
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
export function getPackageDirectory(entrypoint: string): string {
  let directory = path.join(
    path.dirname(entrypoint),
    path.basename(entrypoint, path.extname(entrypoint)),
  );
  if (path.basename(directory) === 'index') {
    directory = path.dirname(directory);
  }
  return directory;
}

/**
 * Get the "main" file path for entrypoint's package
 * @param entrypoint
 */
export async function getMainFile(
  entrypoint: string,
): Promise<string | undefined> {
  const directory = getPackageDirectory(entrypoint);
  const pkg = await readJSONFile(path.join(directory, 'package.json'));
  return pkg.main;
}

export async function getMainTypeFile(
  entrypoint: string,
): Promise<string | undefined> {
  const mainFile = await getMainFile(entrypoint);
  if (!mainFile) {
    return undefined;
  }
  return path.join(
    path.dirname(mainFile),
    `${path.basename(mainFile, path.extname(mainFile))}.d.ts`,
  );
}

/**
 * Get the "main" file path for entrypoint's package
 * @param entrypoint
 */
export async function getModuleFile(
  entrypoint: string,
): Promise<string | undefined> {
  const directory = getPackageDirectory(entrypoint);
  const pkg = await readJSONFile(path.join(directory, 'package.json'));
  return pkg.module;
}

export async function getModuleTypeFile(
  entrypoint: string,
): Promise<string | undefined> {
  const moduleFile = await getModuleFile(entrypoint);
  if (!moduleFile) {
    return undefined;
  }
  return path.join(
    path.dirname(moduleFile),
    `${path.basename(moduleFile, path.extname(moduleFile))}.d.ts`,
  );
}
