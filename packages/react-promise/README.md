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

### useDeferredPromise

Start resolving a promise when triggered e.g. change data on the server after the user clicks a button

```js
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
  const {isPending, invoke: save} = useDeferredPromise(
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

### usePromise()

Immediately executes an operation.

#### Parameters:

- `fn` - A function that returns the promise to be fulfilled.
- `opts` - Options to configure the behaviour of the hook.

#### Returns:

- `.value` - The value returned by the operation.
- `.status` - Whether the promise is pending, fulfilled or rejected.
- `.error` - The reason why the promise was rejected.
- `.isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `.isFulfilled` - Whether the promise has been fulfilled.
- `.isRejected`- Whether the promise has rejected.
- `.invoke`- A fn to execute the operation again.
- `.invokeAsync`- A fn to execute the operation again.

### useInvokablePromise()

Executes an operation when the `invoke` method is called.

#### Parameters:

- `fn` - A function that returns the observable to be observed.
- `opts` - Options to configure the behaviour of the hook

#### Returns:

- `.value` - The value returned by the operatio.
- `.status` - Whether the promise is pending, fulfilled or rejected.
- `.error` - The reason why the promise was rejected.
- `.isPending` - Whether we're waiting for the promise to be fulfilled or rejected.
- `.isFulfilled` - Whether the promise has been fulfilled.
- `.isRejected`- Whether the promise has rejected.
- `.invoke` - A function to invoke the operation.
- `.invokeAsync` - A function to invoke the operation.
