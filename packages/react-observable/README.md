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

Start observing an observable as soon as the component mounts.

#### Parameters:

- `keys` - A unique set of keys for the observable.
- `factory` - A function which creates the observable.
- `options` - Options to configure the behaviour of the hook.

#### Returns:

- `.status` - Whether we are waiting to receive a value from the observable, whether we have received a value, or the observable has completed or errored.
- `.value` - The most recent value received from the observable.
- `.error` - The error received from the observable.
- `.isWaiting` - Whether we're waiting to receive a value from the observable.
- `.isReceived` - Whether a value has been received from the observable.
- `.isCompleted` - Whether the observable has completed.
- `.isErrored` - Whether the observable has errored.
- `.invoke` - A function to invoke the observable again.

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
  const {value, error} = useObservable([id], () => getUser(id));
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

### useDeferredObservable()

Start observing an observable when invoked manually.

#### Parameters:

- `keys` - A unique set of keys for the observable.
- `factory` - A function which creates the observable.
- `options` - Options to configure the behaviour of the hook.

#### Returns:

- `.status` - Whether we are waiting to receive a value from the observable, whether we have received a value, or the observable has completed or errored.
- `.value` - The most recent value received from the observable.
- `.error` - The error received from the observable.
- `.isWaiting` - Whether we're waiting to receive a value from the observable.
- `.isReceived` - Whether a value has been received from the observable.
- `.isCompleted` - Whether the observable has completed.
- `.isErrored` - Whether the observable has errored.
- `.invoke` - A function to invoke the observable again.

```js
import * as React from 'react';
import {fromFetch} from 'rxjs/fetch';
import {useDeferredObservable} from '@jameslnewell/react-observable';

const putUser = (id, data) => {
  return fromFetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const EditUserProfile = ({id}) => {
  const input = React.useRef(null);
  const {isReceiving, invoke: save} = useDeferredObservable(
    (data) => putUser(id, data),
    [id],
  );
  const handleSubmit = async (event) => {
    event.preventDefault();
    save({name: input.current.value});
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={input} />
      <button disabled={isReceiving}>Save</button>
    </form>
  );
};
```
