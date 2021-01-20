# @jameslnewell/react-mounted

![npm (scoped)](https://img.shields.io/npm/v/@jameslnewell/react-mounted.svg)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/@jameslnewell/react-mounted)](https://bundlephobia.com/result?p=@jameslnewell/react-mounted)
[![Actions Status](https://github.com/jameslnewell/react/workflows/main/badge.svg)](https://github.com/jameslnewell/react/actions)

🎣 React hook for checking whether a component has been mounted or unmounted.

## Installation

NPM:

```
npm i -s @jameslnewell/react-mounted
```

Yarn:

```
yarn add @jameslnewell/react-mounted
```

## Usage

```jsx
import React, {useState, useEffect} from 'react';
import useMounted from '@jameslnewell/react-mounted';

const fetch = () =>
  new Promise((resolve) => setTimeout(() => resolve('data'), 3000));

const Fetch = () => {
  const [data, setData] = useState(undefined);
  const mounted = useMounted();

  useEffect(
    () =>
      fetch().then((data) => {
        if (mounted) {
          setState(data);
        }
      }),
    [fetch, mounted, setState],
  );

  return null;
};
```
