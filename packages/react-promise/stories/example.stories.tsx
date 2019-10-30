import * as React from 'react';
import {useState, useEffect} from 'react';
import {storiesOf} from '@storybook/react';
import {usePromise, useInvokablePromise} from '../src';
import './styles.css';

async function getUser(id: string): Promise<{name: string}> {
  console.log(`getUser(${id})`);
  return new Promise(resolve =>
    setTimeout(() => resolve({name: 'LunaticClaw'}), 1000),
  );
}

async function putUser(id: string, data: {name: string}): Promise<void> {
  console.log(`putUser(${id}, ${data})`);
  return new Promise(resolve => setTimeout(() => resolve(), 1000));
}

const Example: React.FC<{id: string}> = ({id}) => {
  const [name, setName] = useState<string>('');
  const [isEdited, setEdited] = useState<boolean>(false);
  const [user, loading] = usePromise(() => getUser(id), [id]);
  const [save, , saving] = useInvokablePromise(name => putUser(id, {name}), [
    id,
  ]);

  // reset the name when the name loads from the server
  useEffect(() => {
    setName((user && user.name) || '');
    setEdited(false);
  }, [user && user.name]);

  const isLoading = loading.isPending;
  const isLoadingError = loading.isRejected;
  const isSaving = saving.isPending;
  const canEdit = !isLoading && !isLoadingError && !isSaving;
  const canSave = !isLoading && !isLoadingError && !isSaving && isEdited;
  const isSaved = saving.isFulfilled && !isEdited;
  const error = loading.error || saving.error;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdited(true);
    setName(event.target.value);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await save();
    setEdited(false);
  };

  return (
    <form onSubmit={handleSave}>
      <input disabled={!canEdit} value={name} onChange={handleChange} />
      {isEdited && '📝'}
      {(isLoading || isSaving) && '🔄'}
      {isSaved && '✅'}
      {error && <span style={{color: 'red'}}>❌ {error}</span>}
      <br />
      <button disabled={!canSave}>Save</button>
    </form>
  );
};

storiesOf('@jameslnewell/react-promise', module).add('Usage', () => (
  <Example id="abc-123" />
));
