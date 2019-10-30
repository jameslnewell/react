# @jameslnewell/react-promise

🎣 React hooks for working with promises.

## Installation

NPM:

```bash
npm install @jameslnewell/react-promise
```

Yarn:

```bash
yarn add @jameslnewell/react-promise
```

## Usage

> [You'll find a working example of `react-promise` in CodeSandbox](https://codesandbox.io/s/jameslnewellreactpromise-xe0om).

### usePromise

Start resolving a promise immediately e.g. fetch data from the server when a component is mounted

```js
import React from 'react';
import {usePromise} from '@jameslnewell/react-promise';

const getUser = async (id) => {
  const res = await fetch(`/user/${id}`, {method: 'GET'});
  const data = await res.json();
  return data;
};

const UserProfile = ({id}) => {
  const [user, {status}] = usePromise(() => getUsername(id), [id]);
  switch (status) {
    case 'pending':
      return <>Loading...</>;
    case 'fulfilled':
      return (
        <>
          Hello <strong>{user.name}</strong>!
        </>
      );
    case 'rejected':
      return (
        <>
          Sorry, we couldn't find that user.
        <>
      );
  }
};

```

### useInvokablePromise

Start resolving a promise when triggered e.g. change data on the server after the user clicks a button

```js
import React, {useState, useEffect} from 'react';
import {useInvokablePromise} from '@jameslnewell/react-promise';

const putUser = async (id, data) => {
  await fetch(`/user/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const EditUserProfile = ({id}) => {
  const input = React.useRef(null);
  const [save, , {isPending}] = useInvokablePromise(data => putUser(id, data), [
    id,
  ]);
  const handleSave = async event => save(id, {name: input.current.value});
  return (
    <>
      <input ref={input} />
      <button disabled={isPending} onClick={handleSave}>
        Save
      </button>
    </>
  );
};
```

## API

### usePromise()

Immediately executes an operation.

#### Parameters:

- `fn` - A function that returns the promise to be fulfilled.
- `deps` - Any value that the function is dependent on and should trigger a new promise to be resolved.

#### Returns:

- `[0]` - The value returned by the operation.
- `[1].status` - Whether the promise is pending, fulfilled or rejected.
- `[1].error` - The reason why the promise was rejected.
- `[1].isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `[1].isFulfilled` - Whether the promise has been fulfilled.
- `[1].isRejected`- Whether the promise has rejected

### useInvokablePromise()

Executes an operation when the `invoke` method is called.

#### Parameters:

- `fn` - A function that returns the observable to be observed.
- `deps` - Any value that the function is dependent on and should trigger a new subscription on a new promise.

#### Returns:

- `[0]` - A function to invoke the operation.
- `[1]` - The value returned by the operation.
- `[2].status` - Whether the promise is pending, fulfilled or rejected.
- `[2].error` - The reason why the promise was rejected.
- `[2].isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `[2].isFulfilled` - Whether the promise has been fulfilled.
- `[2].isRejected`- Whether the promise has rejected
