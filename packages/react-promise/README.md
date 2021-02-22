# @jameslnewell/react-promise

![npm (scoped)](https://img.shields.io/npm/v/@jameslnewell/react-promise.svg)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/@jameslnewell/react-promise)](https://bundlephobia.com/result?p=@jameslnewell/react-promise)
[![Actions Status](https://github.com/jameslnewell/react/workflows/main/badge.svg)](https://github.com/jameslnewell/react-promise/actions)

🎣 React hooks and resources for working with promises.

> If you need to work with observables, try [`@jameslnewell/react-observable`](https://github.com/jameslnewell/react-observable).

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

Start resolving a promise as soon as the component mounts.

#### Parameters:

- `keys` - A unique set of keys for the promise.Keys should be serializable and shallow-equal.
- `factory` - A function which creates the promise.
- `options` - Options to configure the behaviour of the hook.

#### Returns:

- `.status` - Whether the promise is pending, fulfilled or rejected.
- `.value` - The value of the promise after it is fulfilled.
- `.error` - The value of the promise after it is rejected.
- `.isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `.isFulfilled` - Whether the promise has been fulfilled.
- `.isRejected`- Whether the promise has rejected.
- `.invoke`- A function to invoke the promise again.

```jsx
import React from 'react';
import {usePromise} from '@jameslnewell/react-promise';

const getUser = async (id) => {
  const res = await fetch(`/user/${id}`, {method: 'GET'});
  const data = await res.json();
  return data;
};

const UserProfile = ({id}) => {
  const {value} = usePromise([id], () => getUser(id));
  switch (true) {
    case error:
      return <p>Sorry, something went wrong.</p>;
    case value:
      return (
        <p>
          Hello <strong>{user.name}</strong>!
        </p>
      );
    default:
      return <p>Loading...</p>;
  }
};
```

### useDeferredPromise

Start resolving a promise when invoked manually.

#### Parameters:

- `keys` - A unique set of keys for the promise. Keys should be serializable and shallow-equal.
- `factory` - A function which creates the promise.
- `options` - Options to configure the behaviour of the hook.

#### Returns:

- `.status` - Whether the promise is pending, fulfilled or rejected.
- `.value` - The value of the promise after it is fulfilled.
- `.error` - The value of the promise after it is rejected.
- `.isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `.isFulfilled` - Whether the promise has been fulfilled.
- `.isRejected`- Whether the promise has rejected.
- `.invoke`- A function to invoke the promise again.

```jsx
import React, {useState, useEffect} from 'react';
import {useDeferredPromise} from '@jameslnewell/react-promise';

const putUser = async (id, data) => {
  await fetch(`/user/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const EditUserProfile = ({id}) => {
  const input = React.useRef(null);
  const {isPending, invoke: save} = useDeferredPromise([id], (data) =>
    putUser(id, data),
  );
  const handleSubmit = async (event) => {
    event.preventDefault();
    save({name: input.current.value});
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={input} />
      <button disabled={isPending}>Save</button>
    </form>
  );
};
```
