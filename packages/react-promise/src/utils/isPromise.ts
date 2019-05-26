export function isPromise<T>(
  promise: Promise<T> | undefined,
): promise is Promise<T> {
  return (
    typeof promise !== 'undefined' &&
    typeof (promise as Promise<T>).then === 'function'
  );
}
