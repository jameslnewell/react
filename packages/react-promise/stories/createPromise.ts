export type PromiseType = 'none' | 'resolve' | 'reject';

export function createPromise(
  type: PromiseType,
  delay: number,
): Promise<{type: PromiseType; delay: number}> | undefined {
  if (type === 'none') {
    return undefined;
  }
  return new Promise(
    (resolve, reject): void => {
      setTimeout((): void => {
        if (type === 'resolve') {
          resolve({type, delay});
        } else if (type === 'reject') {
          reject(new Error('Rejected!'));
        }
      }, delay);
    },
  );
}
