import resolveBinCallback from 'resolve-bin';

export async function resolveBin(
  name: string,
  options: {executable?: string} = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    resolveBinCallback(name, options, (error, path) => {
      if (error) {
        reject(error);
      } else {
        resolve(path);
      }
    });
  });
}
