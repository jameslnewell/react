import {act, renderHook} from '@testing-library/react-hooks';
import {wrapper} from '../__tests__/wrapper';
import {useAddDocument} from './useAddDocument';

describe('firestore', () => {
  describe('useAddDocument()', () => {
    test('creates a document', async () => {
      const collection = 'users';
      const document = {name: 'Johnny Applesmith'};
      const {result} = renderHook(() => useAddDocument(collection), {wrapper});
      await act(async () => {
        const [invoke] = result.current;
        await invoke(document);
      });
      const [, ref] = result.current;
      const data = await ref?.get();
      expect(data?.data()).toEqual(document);
    });
  });
});
