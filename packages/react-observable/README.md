# @jameslnewell/react-observable

![npm (scoped)](https://img.shields.io/npm/v/@jameslnewell/react-observable.svg)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/@jameslnewell/react-observable)](https://bundlephobia.com/result?p=@jameslnewell/react-observable)
[![Actions Status](https://github.com/jameslnewell/react-observable/workflows/main/badge.svg)](https://github.com/jameslnewell/react-observable/actions)

🎣 React utilities for working with observables.

> If you need to work with promises, try [`@jameslnewell/react-promise`](https://github.com/jameslnewell/react-promise).

## Installation

NPM:

```bash
npm install @jameslnewell/react-observable rxjs@^6
```

Yarn:

```bash
yarn add @jameslnewell/react-observable rxjs@^7
```

## Usage

> [You'll find a working example of `react-observable` in CodeSandbox](https://codesandbox.io/s/jameslnewellreact-observable-sup96).

### createResource(observable)

Creates a resource to manage the state of an observable.

> For use with `<React.Suspense/>`

#### Parameters:

- `observable: Observable` - The observable

#### Returns:

The resource.

#### Usage

```js
const {createResource} from '@jameslnewell/react-observable';

const observable = of({name: 'John Smith'}).pipe(delay(1000));

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

### useResource(observable)

Subscribes to a resource, updating the parent component whenever a new value is published.

#### Parameters:

- `resource: Resource` - The resource

#### Returns:

The value.

#### Usage

```js
const {createResource, useResource} from '@jameslnewell/react-observable';

const observable = of({name: 'John Smith'}).pipe(delay(1000));

const resource = createResource(observable);

const Component = () => {
  const profile = useResource(resource);
  return (
    <>
      Hello {profile.name}.
    </>
  );
}
```

### useObservable(observable)

Manage the state of an observable, subscribing to the observable when mounted.

#### Parameters:

- `observable: Observable` - The observable

#### Returns:

- `.status: loading|loaded|errored` - The status of the observable.
- `.value` - The most recent value received from the observable.
- `.error` - The error received from the observable.

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
  const {value, error} = useObservable(React.useMemo(() => getUser(id), [id]));
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

### useInvokableObservable()

Manage the state of an observable, subscribing to the observable when called.

#### Parameters:

- `observable: Observable` - The observable

#### Returns:

- `.invoke` - A function to invoke the observable.
- `.status: loading|loaded|errored` - The status of the observable.
- `.value` - The most recent value received from the observable.
- `.error` - The error received from the observable.

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
  const {loading, invoke: save} = useInvokableObservable(
    React.useCallback((data) => putUser(id, data), [id]),
  );
  const handleSubmit = async (event) => {
    event.preventDefault();
    save({name: input.current.value});
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={input} />
      <button disabled={status === 'loading'}>Save</button>
    </form>
  );
};
```
