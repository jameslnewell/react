import * as React from 'react';
import {useState, useEffect} from 'react';
import {storiesOf} from '@storybook/react';
import {usePromise, useInvokablePromise} from '../src';
import './styles.css';

async function getUsername(id: string): Promise<string> {
  console.log(`getUsername(${id})`);
  return new Promise(resolve => setTimeout(() => resolve('LunaticClaw'), 1000));
}

async function putUsername(id: string, username: string): Promise<void> {
  console.log(`putUsername(${id}. ${username})`);
  return new Promise(resolve => setTimeout(() => resolve(), 1000));
}

const Example: React.FC<{id: string}> = ({id}) => {
  const [username, setUsername] = useState<string>('');
  const [isEdited, setEdited] = useState<boolean>(false);

  const load = usePromise(() => getUsername(id), [id]);

  const save = useInvokablePromise(() => putUsername(id, username), [
    id,
    username,
  ]);

  // reset the username when it loads
  useEffect(() => {
    setUsername(load.value || '');
    setEdited(false);
  }, [load.value]);

  const isLoading = load.isPending;
  const isLoadingError = load.isRejected;
  const isSaving = save.isPending;
  const canEdit = !isLoading && !isLoadingError && !isSaving;
  const canSave = !isLoading && !isLoadingError && !isSaving && isEdited;
  const isSaved = save.isFulfilled && !isEdited;
  const error = load.error || save.error;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEdited(true);
    setUsername(event.target.value);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await save.invoke(id, username);
    setEdited(false);
  };

  return (
    <form onSubmit={handleSave}>
      <input disabled={!canEdit} value={username} onChange={handleChange} />
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
