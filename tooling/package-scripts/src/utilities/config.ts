import {readJSON} from 'fs-extra';

interface Config {
  entrypoints: string[];
}

const defaultConfig = {
  entrypoints: ['index'],
};

export async function readConfigFile(): Promise<Config> {
  const pkg = await readJSON('package.json');
  return {
    ...defaultConfig,
    ...pkg['package-scripts'],
  };
}
