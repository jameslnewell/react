# @jameslnewell/react-observable

![npm (scoped)](https://img.shields.io/npm/v/@jameslnewell/react-observable.svg)
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

Start observing the observable immediately to request data from a server.

```js
import React from 'react';
import {fromFetch} from 'rxjs/fetch';
import {switchMap, map} from 'rxjs/operators';
import {useObservable} from '@jameslnewell/react-observable';

const getUsername = async id => {
  return fromFetch(`https://jsonplaceholder.typicode.com/users/${id}`).pipe(
    switchMap(response => response.json()),
    map(data => data.username),
  );
};

const UserProfile = ({id}) => {
  const [username, {status, error}] = useInvokableObservable(
    () => getUsername(id),
    [id],
  );
  return (
    <>
      {status === 'waiting' && '⏳ Waiting...'}
      {status === 'received' && `⏺ Recieved ${username}`}
      {status === 'completed' && `🏁 Completed ${username}`}
      {status === 'errored' && `❌ ${String(error)}`}
    </>
  );
};
```

### useInvokableObservable()

Start observing the observable on interaction to send data from a server.

```js
import * as React from 'react';
import {fromFetch} from 'rxjs/fetch';
import {useInvokableObservable} from '@jameslnewell/react-observable';

function putUsername(id, username) {
  return fromFetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    method: 'POST',
    body: JSON.stringify({username}),
  });
}

const UserProfile = ({id}) => {
  const input = React.useRef(null);
  const [save, value, {status, error}] = useInvokableObservable(
    username => putUsername(id, username),
    [id],
  );
  return (
    <>
      <input ref={input} />
      <button onClick={() => save(input.current.value)}>Update</button>
      <hr />
      {status === 'waiting' && '⏳ Waiting...'}
      {status === 'received' && `⏺ Recieved ${value}`}
      {status === 'completed' && `🏁 Completed ${value}`}
      {status === 'errored' && `❌ ${String(error)}`}
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
