# @jameslnewell/react-observable

![npm (scoped)](https://img.shields.io/npm/v/@jameslnewell/react-observable.svg)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/@jameslnewell/react-observable)](https://bundlephobia.com/result?p=@jameslnewell/react-observable)
[![Actions Status](https://github.com/jameslnewell/react-observable/workflows/main/badge.svg)](https://github.com/jameslnewell/react-observable/actions)

🎣 React hooks for working with observables.

> If you need to work with promises, try [`@jameslnewell/react-promise`](https://github.com/jameslnewell/react-promise).

## Installation

NPM:

```bash
npm install @jameslnewell/react-observable
```

Yarn:

```bash
yarn add @jameslnewell/react-observable
```

## Usage

> [You'll find a working example of `react-observable` in CodeSandbox](https://codesandbox.io/s/jameslnewellreact-observable-sup96).

### useObservable()

Start observing an observable immediately e.g. fetch data from the server when a component is mounted

```js
import React from 'react';
import {fromFetch} from 'rxjs/fetch';
import {switchMap, map} from 'rxjs/operators';
import {useObservable} from '@jameslnewell/react-observable';

const getUser = (id) => {
  return fromFetch(`https://jsonplaceholder.typicode.com/users/${id}`).pipe(
    switchMap((response) => response.json()),
    map((data) => data.username),
  );
};

const UserProfile = ({id}) => {
  const [user, {status, error}] = useObservable(() => getUser(id), [id]);
  switch (status) {
    case 'waiting':
      return <>Loading...</>;
    case 'received':
    case 'completed':
      return (
        <>
          Hello <strong>{user}</strong>!
        </>
      );
    case 'errored':
      return <>Sorry, we couldn't find that user.</>;
    default:
      return null;
  }
};
```

### useInvokableObservable()

Start observing an observable when triggered e.g. change data on the server after the user clicks a button

```js
import * as React from 'react';
import {fromFetch} from 'rxjs/fetch';
import {useInvokableObservable} from '@jameslnewell/react-observable';

const putUser = (id, data) => {
  return fromFetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const EditUserProfile = ({id}) => {
  const input = React.useRef(null);
  const [save, , {isReceiving}] = useInvokableObservable(
    (data) => putUser(id, data),
    [id],
  );
  const handleSave = async (event) => save(id, {name: input.current.value});
  return (
    <>
      <input ref={input} />
      <button disabled={isReceiving} onClick={handleSave}>
        Save
      </button>
    </>
  );
};
```

## API

### useObservable()

Immediately subscribes to an observable.

#### Parameters:

- `fn` - A function that returns the observable to be observed.
- `deps` - Any value that the function is dependent on and should trigger a new subscription on a new observable.

#### Returns:

- `[0]` - The value observed from the observable.
- `[1].status` - Whether the observable is waiting, recieved, completed or errored.
- `[1].error` - The error observed from the observable.
- `[1].isWaiting` - Whether we're waiting on a value from the observable.
- `[1].isReceieved` - Whether we've recevied a value from the observable.
- `[1].isCompleted`- Whether the observable has completed.
- `[1].isErrored`- Whether the observable has errored.

### useInvokableObservable()

Subscribes to an observable when the `invoke` method is called.

#### Parameters:

- `fn` - A function that returns the observable to be observed.
- `deps` - Any value that the function is dependent on and should trigger a new subscription on a new observable.

#### Returns:

- `[0]` - A function to invoke the observable.
- `[1]` - The value observed from the observable.
- `[2].status` - Whether the observable is waiting, recieved, completed or errored.
- `[2].error` - The error observed from the observable.
- `[2].isWaiting` - Whether we're waiting on a value from the observable.
- `[2].isReceieved` - Whether we've recevied a value from the observable.
- `[2].isCompleted`- Whether the observable has completed.
- `[2].isErrored`- Whether the observable has errored.
