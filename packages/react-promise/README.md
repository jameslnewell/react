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

### createResource

A function implementing the [Render-as-You-Fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) pattern using Suspense.

```jsx
import React from 'react';
import {createResource} from '@jameslnewell/react-promise';

const getUser = async (id) => {
  const res = await fetch(`/user/${id}`, {method: 'GET'});
  const data = await res.json();
  return data;
};

const userResource = createResource(getUser);

const UserGreeting = ({id}) => {
  const user = userResource.read(id);
  return (
    <>
      Hello <strong>{user.name}</strong>!
    </>
  );
};

const UserProfile = () => {
  const {id} = useParams();
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UserGreeting id={123} />
    </Suspense>
  );
};
```

### usePromise

A hook implementing the [Fetch-on-Render](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-1-fetch-on-render-not-using-suspense) pattern.

Starts resolving the promise immediately e.g. fetch data from the server when a component is mounted

```jsx
import React from 'react';
import {usePromise} from '@jameslnewell/react-promise';

const getUser = async (id) => {
  const res = await fetch(`/user/${id}`, {method: 'GET'});
  const data = await res.json();
  return data;
};

const UserProfile = ({id}) => {
  const {id} = useParams();
  const {error, value}] = usePromise(() => getUser(id), [id]);
  switch (true) {
    case error:
      return (
        <>
          Sorry, something went wrong.
        <>
      );
    case value:
      return (
        <>
          Hello <strong>{user.name}</strong>!
        </>
      );
    default:
      return <>Loading...</>;
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
  const {isPending, invoke: save} = useInvokablePromise(
    (data) => putUser(id, data),
    [id],
  );
  const handleSave = async (event) => save(id, {name: input.current.value});
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

### createResource()

Creates a resource.

#### Parameters:

- `fn` - A function that returns the promise to be fulfilled.

#### Returns:

- `.status` - Whether the promise is pending, fulfilled or rejected.
- `.value` - The value returned by the operation.
- `.error` - The reason why the promise was rejected.
- `.read()` - Invokes the function and returns the result.
- `.preload()` - Invoke the function if it hasn't already been invoked.
- `.reload()`- Invoke the function.

### usePromise()

Immediately executes an operation.

#### Parameters:

- `fn` - A function that returns the promise to be fulfilled.
- `deps` - Any value that the function is dependent on and should trigger a new promise to be resolved.
- `opts` - Options to configure the behaviour of the hook.

#### Returns:

- `.value` - The value returned by the operation.
- `.status` - Whether the promise is pending, fulfilled or rejected.
- `.error` - The reason why the promise was rejected.
- `.isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `.isFulfilled` - Whether the promise has been fulfilled.
- `.isRejected`- Whether the promise has rejected.
- `.invoke`- A fn to execute the operation again.

### useInvokablePromise()

Executes an operation when the `invoke` method is called.

#### Parameters:

- `fn` - A function that returns the observable to be observed.
- `deps` - Any value that the function is dependent on and should trigger a new subscription on a new promise.

#### Returns:

- `.value` - The value returned by the operatio.
- `.status` - Whether the promise is pending, fulfilled or rejected.
- `.error` - The reason why the promise was rejected.
- `.isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `.isFulfilled` - Whether the promise has been fulfilled.
- `.isRejected`- Whether the promise has rejected.
- `.invoke` - A function to invoke the operation.
- `.invokeAsync` - A function to invoke the operation.
