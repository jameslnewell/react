import {fromArray} from '@jameslnewell/observable';
import {createResource} from './createResource';
import {
  error,
  value,
  createWaitingObservable,
  createErroredObservable,
  createReceivedObservable,
} from './__fixtures__';

describe('createResource()', () => {
  test('throws a promise when already waiting', () => {
    const resource = createResource(createWaitingObservable);
    resource.preload();
    expect(() => resource.read()).toThrow(expect.any(Promise));
  });

  test('throws a promise when transitioned to waiting', () => {
    const resource = createResource(createWaitingObservable);
    expect(() => resource.read()).toThrow(expect.any(Promise));
  });

  test('returns a value when transitioned to received', async () => {
    const resource = createResource(createReceivedObservable);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(resource.read()).toEqual(value);
  });

  test('throws an error when transitioned to errored', async () => {
    const resource = createResource(createErroredObservable);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(() => resource.read()).toThrow(error);
  });

  test.only('returns a cached value when already received', async () => {
    const resource = createResource(createReceivedObservable);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(resource.read()).toEqual(value);
    expect(resource.read()).toEqual(value);
  });

  test('throws a cached error when already errored', async () => {
    const resource = createResource(createErroredObservable);
    try {
      resource.read();
    } catch (error) {
      await error;
    }
    expect(() => resource.read()).toThrow(error);
    expect(() => resource.read()).toThrow(error);
  });

  test('different parameters are cached separately', async () => {
    const id1 = 'abc';
    const id2 = 'xyz';
    const resource = createResource((id: string) => fromArray([id]));
    try {
      resource.read(id1);
    } catch (error1) {
      await error1;
    }
    try {
      resource.read(id2);
    } catch (error2) {
      await error2;
    }
    expect(resource.read(id1)).toEqual(id1);
    expect(resource.read(id2)).toEqual(id2);
  });
});
