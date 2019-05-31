# @jameslnewell/react-observable

React hooks for working with observables.

## Installation

```bash
yarn add @jameslnewell/react-observable
```

## Usage

```js
import React, {useState, useEffect} from 'react';
import {usePromise, useInvokablePromise} from '@jameslnewell/react-observable';

async function getUsername(id) {
  const res = await fetch(`/user/${id}`, {method: 'GET'});
  const data = await res.json();
  return data.username;
}

async function putUsername(id, username) {
  await fetch(`/user/${id}`, {
    method: 'POST',
    body: JSON.stringify({username}),
  });
}

const Username = ({id}) => {
  const [username, setUsername] = useState('');
  const [isEdited, setEdited] = useState(false);

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
      {isLoading || (isSaving && '🔄')}
      {isSaved && '✅'}
      {error && <span style={{color: 'red'}}>❌ {error}</span>}
      <br />
      <button disabled={!canSave}>Save</button>
    </form>
  );
};
```
