import * as fs from 'fs';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);

const jsonCache = new Map<string, unknown>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJSONFile(file: string): Promise<any> {
  const cachedJSON = jsonCache.get(file);
  if (cachedJSON) {
    return cachedJSON;
  } else {
    const buffer = await readFile(file);
    const parsedJSON = JSON.parse(buffer.toString());
    return parsedJSON;
  }
}
