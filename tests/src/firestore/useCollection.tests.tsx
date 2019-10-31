/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {renderHook} from '@testing-library/react-hooks';
import {useCollection} from '@jameslnewell/react-firebase/firestore';
import {wrapper} from '../wrapper';
import {Status} from '@jameslnewell/react-observable';
import {app} from '../app';

describe('useCollection()', () => {
  afterEach(() => {
    app.firestore().terminate();
  });

  test('returned a collection snapshot after mounting', async () => {
    // render the hook
    const {result, waitForNextUpdate} = renderHook(
      () => useCollection('users'),
      {wrapper},
    );

    // expect we're waiting for data
    expect(result.current).toEqual([
      undefined,
      {
        status: Status.Waiting,
        isWaiting: true,
        isReceived: false,
        isCompleted: false,
        isErrored: false,
      },
    ]);

    // wait until the state has updated
    await waitForNextUpdate();

    // expect we've received data
    expect(result.current).toEqual([
      expect.any(Object),
      {
        status: Status.Receieved,
        isWaiting: false,
        isReceived: true,
        isCompleted: false,
        isErrored: false,
      },
    ]);

    // expect the database to return some results
    expect(result.current[0]!.empty).not.toBeTruthy();
    expect(Array.isArray(result.current[0]!.docs)).toBeTruthy();
  });
});
