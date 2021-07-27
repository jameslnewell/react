import * as child_process from 'child_process';

export async function passthru(
  command: string,
  args: string[],
  options: {debug?: boolean} = {},
): Promise<void> {
  return new Promise((resolve) => {
    const child = child_process.fork(command, args, {
      execArgv: options.debug ? ['--inspect-brk'] : [],
      cwd: process.cwd(),
    });

    process.on('SIGINT', () => {
      child.kill('SIGINT');
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        resolve();
        process.exitCode = code ?? -1;
      }
    });
  });
}
