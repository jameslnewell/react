import {readJSONFile} from './readJSONFile';

interface Config {
  entrypoints: string[];
}

const defaultConfig = {
  entrypoints: ['index'],
};

export async function readConfigFile(): Promise<Config> {
  const pkg = await readJSONFile('package.json');
  return {
    ...defaultConfig,
    ...pkg['package-scripts'],
  };
}
