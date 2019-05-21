# @jameslnewell/react-promise

A react hook for working with promises.

## Installation

```bash
yarn add @jameslnewell/react-promise
```

## Usage

```js
import usePromise from '@jameslnewell/react-promise';

async function getProfile(username) {
  const res = await fetch(`/profile/${username}`);
  const data = res.json();
  return data;
}

function Profile({username}) {
  const [status, error, data] = usePromise(() => getProfile(username), [username]);
  switch (status) {
    
    case 'loading':
      return <>loading 🔄</>;

    case 'loaded':
      return <>loaded ✅: <pre>{JSON.stringify(data)}</pre></>;

    case 'errored':
      return <>errored ❌: <pre>{String(error)}</pre></>;

    default:
      return <>?</>;
      
  }
}

```
