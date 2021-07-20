import {collection, doc} from '@firebase/firestore';
import React from 'react';
import {decorator} from '../__utilities__/decorator';
import {firestore} from '../__utilities__/firebase';
import {
  useAddDocument,
  useDeleteDocument,
  useSetDocument,
  useUpdateDocument,
} from './document';

export default {
  title: 'react-firebase/document',
  decorators: [decorator],
};

export const UseAddDocument: React.FC = () => {
  const {invoke, isLoading} = useAddDocument(collection(firestore, 'animals'));
  return (
    <button
      onClick={() => invoke({type: 'horse', name: 'bobby'})}
      disabled={isLoading}
    >
      Add document
    </button>
  );
};

export const UseSetDocument: React.FC = () => {
  const {invoke, isLoading} = useSetDocument(doc(firestore, 'animals/abc123'));
  return (
    <button
      onClick={() => invoke({type: 'horse', name: 'bobby'})}
      disabled={isLoading}
    >
      Set document
    </button>
  );
};

export const UseUpdateDocument: React.FC = () => {
  const {invoke, isLoading} = useUpdateDocument(
    doc(firestore, 'animals/abc123'),
  );
  return (
    <button
      onClick={() => invoke({type: 'horse', name: 'bobby'})}
      disabled={isLoading}
    >
      Update document
    </button>
  );
};

export const UseDeleteDocument: React.FC = () => {
  const {invoke, isLoading} = useDeleteDocument(
    doc(firestore, 'animals/abc123'),
  );
  return (
    <button onClick={() => invoke()} disabled={isLoading}>
      Delete document
    </button>
  );
};
