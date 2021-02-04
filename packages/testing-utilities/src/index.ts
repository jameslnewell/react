export async function waitForTimeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForQueuedFunctions(): Promise<void> {
  return waitForTimeout(0);
}

export async function waitForExpect(
  condition: () => void,
  timeout: number = 1000,
): Promise<void> {
  const endTime = Date.now() + timeout;
  return new Promise((resolve, reject) => {
    const check = (): void => {
      try {
        condition();
        resolve();
      } catch (error) {
        if (Date.now() > endTime) {
          reject(error);
        } else {
          setTimeout(check, Math.min(10, endTime - Date.now()));
        }
      }
    };
    check();
  });
}
