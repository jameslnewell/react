import React from 'react';
import {collection} from '@firebase/firestore';
import {decorator} from '../__utilities__/decorator';
import {createCollectionResource} from '.';
import {firestore} from '../__utilities__/firebase';
import {withSuspense} from 'testing-utilities';

export default {
  title: 'react-firebase/firestore/collection',
  decorators: [decorator],
};

const collectionRef = collection(firestore, 'animals');

const collectionResource = createCollectionResource(collectionRef);
export const CreateCollectionResource: React.FC = withSuspense()(() => {
  const document = collectionResource.read();
  return (
    <pre>
      <code>{JSON.stringify(document, null, 2)}</code>
    </pre>
  );
});
