import {decorator} from '../__utilities__/decorator';
import {useDocument, useCollection, useAddDocument, useSetDocument} from '.';

import React, {useState, Suspense} from 'react';

export default {
  title: 'react-firebase/firestore',
  decorators: [decorator],
};

interface Animal {
  name: string;
  species: string;
}

interface AnimalFormProps {
  isSubmitting: boolean;
  value: unknown | undefined;
  error: unknown | undefined;
  defaultValue?: Animal;
  onSubmit: (animal: Animal) => void;
}

const AnimalForm: React.FC<AnimalFormProps> = ({
  isSubmitting,
  value,
  error,
  defaultValue,
  onSubmit,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    let name = '';
    const nameInput = event.currentTarget.elements.namedItem('name');
    if (nameInput) {
      name = (nameInput as HTMLInputElement).value;
    }

    let species = '';
    const speciesInput = event.currentTarget.elements.namedItem('species');
    if (speciesInput) {
      species = (speciesInput as HTMLInputElement).value;
    }

    onSubmit({name, species});
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Add an animal</legend>
          <fieldset>
            <legend>Species</legend>
            <label>
              <input
                type="radio"
                name="species"
                value="dog"
                defaultChecked={defaultValue?.species === 'dog'}
              />{' '}
              Dog
            </label>
            <br />
            {console.log('select cat', defaultValue?.species === 'cat')}
            <label>
              <input
                type="radio"
                name="species"
                value="cat"
                defaultChecked={defaultValue?.species === 'cat'}
              />{' '}
              Cat
            </label>
          </fieldset>
          <br />
          <div>
            <label>
              <h4>Name:</h4>
              <input name="name" defaultValue={defaultValue?.name} />
            </label>
          </div>
        </fieldset>
        <br />
        <button disabled={isSubmitting}>Add</button>
      </form>
      {value && <pre>{JSON.stringify(value)}</pre>}
      {error && <pre>{JSON.stringify(error)}</pre>}
    </>
  );
};

export const Collection: React.FC = () => {
  const result = useCollection('animals');
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {result.value?.map(([id, data]) => (
            <tr key={id}>
              <td>{id}</td>
              <td>{JSON.stringify(data)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export const Document: React.FC = () => {
  const result = useDocument('animals/fido');
  return <pre>{JSON.stringify(result.value)}</pre>;
};

export const DocumentDoesNotExist: React.FC = () => {
  const result = useDocument('animals/thelma');
  return <pre>{JSON.stringify(result.value)}</pre>;
};

export const AddDocument: React.FC = () => {
  const result = useAddDocument('animals');
  return (
    <AnimalForm
      isSubmitting={result.isPending}
      value={result.value}
      error={result.error}
      onSubmit={result.invoke}
    />
  );
};

interface SetDocumentFormProps {
  id: string;
}

const SetDocumentForm: React.FC<SetDocumentFormProps> = ({id}) => {
  const document = useDocument<Animal>(`animals/${id}`, {
    suspendWhenWaiting: true,
  });
  const setDocument = useSetDocument(`animals/${id}`);
  console.log('set document form', document);
  return (
    <AnimalForm
      isSubmitting={setDocument.isPending}
      value={setDocument.value}
      error={setDocument.error}
      defaultValue={document.value}
      onSubmit={setDocument.invoke}
    />
  );
};

export const SetDocument: React.FC = () => {
  const [id, setId] = useState('fido');
  return (
    <Suspense fallback={null}>
      <SetDocumentForm id={id} />
    </Suspense>
  );
};
