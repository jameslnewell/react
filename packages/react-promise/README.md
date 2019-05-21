# @jameslnewell/react-promise

React hook for working with promises.

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
      return <>loaded ✅: ${JSON.stringify(data)}</>;

    case 'errored':
      return <>errored ❌: ${String(error)}</>;

    default:
      return <>?</>;
      
  }
}

```
