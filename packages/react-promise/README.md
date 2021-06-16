# @jameslnewell/react-promise

![npm (scoped)](https://img.shields.io/npm/v/@jameslnewell/react-promise.svg)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/@jameslnewell/react-promise)](https://bundlephobia.com/result?p=@jameslnewell/react-promise)
[![Actions Status](https://github.com/jameslnewell/react/workflows/main/badge.svg)](https://github.com/jameslnewell/react-promise/actions)

🎣 React utilities for working with promises.

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

### createResource(observable)

Creates a resource to manage the state of a promise.

> For use with `<React.Suspense/>`

#### Parameters:

- `promise: Promise` - The promise.

#### Returns:

The resource.

#### Usage

```js
const {createResource} from '@jameslnewell/react-promise';

const observable = new Promise((resolve) => setTimeout(() => resolve({name: 'John Smith'}), 1000));

const resource = createResource(observable);

const Component = () => {
  const profile = resource.read();
  return (
    <>
      Hello {profile.name}.
    </>
  );
}
```

### usePromise

Manage the state of a promise.

#### Parameters:

- `promise: Promise` - The promise.

#### Returns:

- `.status: loading|loaded|errored` - The status of the promise.
- `.value` - The value resolved from the promise.
- `.error` - The error rejected from the promise.

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

import React from 'react';
import {useObservable} from '@jameslnewell/react-promise';

const getUser = async (id) => {
  const res = await fetch(`/user/${id}`, {method: 'GET'});
  const data = await res.json();
  return data;
};

const UserProfile = ({id}) => {
  const {value, error} = usePromise(React.useMemo(() => getUser(id), [id]));
  if (error) {
    return <p>Sorry, something went wrong.</p>;
  }
  if (value) {
    return (
      <p>
        Hello <strong>{user.name}</strong>!
      </p>
    );
  }
  return <p>Loading...</p>;
};
```

### useInvokableObservable

Manage the state of an observable, creating the promise when called.

#### Parameters:

- `factory: Function` - The promise factory.

#### Returns:

- `.invoke` - A function to invoke the promise.
- `.status: loading|loaded|errored` - The status of the promise.
- `.value` - The value resolved from the promise.
- `.error` - The error rejected from the promise.

```jsx
import * as React from 'react';
import {useInvokablePromise} from '@jameslnewell/react-promise';

const putUser = async (id, data) => {
  await fetch(`/user/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const EditUserProfile = ({id}) => {
  const input = React.useRef(null);
  const {loading, invoke: save} = useInvokablePromise(
    React.useCallback((data) => putUser(id, data), [id]),
  );
  const handleSubmit = async (event) => {
    event.preventDefault();
    await save({name: input.current.value});
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={input} />
      <button disabled={status === 'loading'}>Save</button>
    </form>
  );
};
```
