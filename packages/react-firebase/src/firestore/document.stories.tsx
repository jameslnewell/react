import {collection, doc} from '@firebase/firestore';
import React from 'react';
import {withSuspense} from '../../../testing-utilities/src';
import {decorator} from '../__utilities__/decorator';
import {firestore} from '../__utilities__/firebase';
import {
  createDocumentResource,
  useAddDocument,
  useDeleteDocument,
  useSetDocument,
  useUpdateDocument,
} from './document';

export default {
  title: 'react-firebase/firestore/document',
  decorators: [decorator],
};

interface Animal {
  type?: string;
  name?: string;
}

const collectionRef = collection(firestore, 'animals');
const documentRef = doc(firestore, 'animals/3PcH9BRmPVilglxLIsLY');

const documentResource = createDocumentResource(documentRef);
export const CreateDocumentResource: React.FC = withSuspense()(() => {
  const document = documentResource.read();
  return (
    <pre>
      <code>{JSON.stringify(document, null, 2)}</code>
    </pre>
  );
});

export const UseAddDocument: React.FC = () => {
  const {invoke, isLoading} = useAddDocument(collectionRef);
  return <AnimalForm isSubmitting={isLoading} label="Add" onSubmit={invoke} />;
};

export const UseSetDocument: React.FC = () => {
  const {invoke, isLoading} = useSetDocument(documentRef);
  return (
    <AnimalForm
      isSubmitting={isLoading}
      label="Set"
      initialValues={documentResource.read()}
      onSubmit={invoke}
    />
  );
};

export const UseUpdateDocument: React.FC = withSuspense()(() => {
  const {invoke, isLoading} = useUpdateDocument(documentRef);
  return (
    <AnimalForm
      isSubmitting={isLoading}
      label="Update"
      initialValues={documentResource.read()}
      onSubmit={invoke}
    />
  );
});

export const UseDeleteDocument: React.FC = () => {
  const {invoke, isLoading} = useDeleteDocument(documentRef);
  return (
    <>
      <button onClick={() => invoke()} disabled={isLoading}>
        Delete document
      </button>
    </>
  );
};

interface AnimalFormProps {
  label: string;
  initialValues?: Animal;
  isSubmitting: boolean;
  onSubmit: (data: Animal) => void;
}

const AnimalForm: React.FC<AnimalFormProps> = ({
  label: actionLabel,
  initialValues,
  isSubmitting,
  onSubmit,
}) => {
  const typeRef = React.createRef<HTMLInputElement>();
  const nameRef = React.createRef<HTMLInputElement>();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          type: typeRef.current?.value ?? '',
          name: nameRef.current?.value ?? '',
        });
      }}
    >
      <div>
        <label>
          Type:
          <br />
          <input ref={typeRef} defaultValue={initialValues?.type} />
        </label>
      </div>
      <div>
        <label>
          Name:
          <br />
          <input ref={nameRef} defaultValue={initialValues?.name} />
        </label>
      </div>
      <button disabled={isSubmitting}>{actionLabel}</button>
    </form>
  );
};
