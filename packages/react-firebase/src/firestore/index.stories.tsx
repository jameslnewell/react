import {decorator} from '../__utilities__/decorator';
import {useDocument, useCollection, useAddDocument, useSetDocument} from '.';

import React, {useState, Suspense} from 'react';
import {RenderJSON, withSuspense} from 'testing-utilities';
import {useRef} from 'react';
import {useDeleteDocument} from './useDeleteDocument';

export default {
  title: 'react-firebase/firestore',
  decorators: [decorator],
};

interface Animal {
  name: string;
  species: string;
}

interface SelectAnimalIdProps {
  onSelect: (id: string) => void;
}

const SelectAnimalId: React.FC<SelectAnimalIdProps> = ({onSelect}) => {
  const idRef = useRef<HTMLInputElement>(null);
  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (idRef.current && idRef.current?.value) {
      onSelect(idRef.current.value);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Select animial</legend>
        <label>
          Animal ID: <input ref={idRef} />
        </label>
        <button>Select</button>
      </fieldset>
    </form>
  );
};

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
  console.log('defaultValue', defaultValue);

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
  const [name, setName] = useState('fido');
  const result = useDocument(`animals/${name}`);
  return (
    <>
      <SelectAnimalId onSelect={setName} />
      <RenderJSON value={result.value} />
    </>
  );
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

export const SetDocument: React.FC = withSuspense()(() => {
  const [id, setId] = useState('fido');
  const document = useDocument<Animal>(`animals/${id}`, {
    suspendWhenWaiting: true,
  });
  const setDocument = useSetDocument(`animals/${id}`);
  return (
    <AnimalForm
      isSubmitting={setDocument.isPending}
      value={setDocument.value}
      error={setDocument.error}
      defaultValue={document.value}
      onSubmit={setDocument.invoke}
    />
  );
});

export const DeleteDocument: React.FC = () => {
  const [name, setName] = useState('fido');
  const result = useDeleteDocument(`animals/${name}`);
  return (
    <>
      <SelectAnimalId onSelect={setName} />
      <RenderJSON value={result.value} />
    </>
  );
};
