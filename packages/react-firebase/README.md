# @jameslnewell/react-firebase

![npm (scoped)](https://img.shields.io/npm/v/@jameslnewell/react-firebase.svg)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/@jameslnewell/react-firebase)](https://bundlephobia.com/result?p=@jameslnewell/react-firebase)
[![Actions Status](https://github.com/jameslnewell/react/workflows/release/badge.svg)](https://github.com/jameslnewell/react/actions)

🎣 React utilities for working with firebase.

## Installation

NPM:

```bash
npm install @jameslnewell/react-firebase
```

Yarn:

```bash
yarn add @jameslnewell/react-firebase
```

## Usage

Provide your app with the firebase "app".

`index.js`

```jsx
import firebase from 'firebase';
import 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import React from 'react';
import ReactDOM from 'react-dom';
import {AppProvider} from '@jameslnewell/react-firebase';
import {App} from './App';

const app = firebase.initializeApp({
  /* your firebase config */
});

ReactDOM.render(
  <AppProvider app={app}>
    <App />
  </AppProvider>,
  document.getElementById('app'),
);
```

`Navbar.js`

```jsx
import React from 'react';
import firebase from 'firebase';
import {useUser, useSignInWithPopup useSignOut} from '@jameslnewell/react-firebase/auth';

export const Navbar = () => {
  const {isAuthenticated} = useStatus();
  const {invoke: signIn} = useSignInWithPopup();
  const {invoke: signOut} = useSignOut();

  const handleSignInOrOut = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      signIn(new firebase.auth.GoogleAuthProvider());
    }
  };

  return (
    <nav>
      <button onClick={handleSignInOrOut}>{isAuthenticated ? 'Sign out' : Sign in}</button>
    </nav>
  );
}
```

`UserProfile.js`

```js
import React from 'react';
import {useDocument} from '@jameslnewell/react-firebase/firestore';

export const UserProfile = ({userId}) => {
  const [user, {status}] = useDocument(`users/${userId}`);
  switch (status) {
    case 'receiving':
      return 'Loading...';
    case 'errored':
      return 'Unable to fetch profile for user';
    default:
      return (
        <>
          {user && user.id}
          {user && user.get('name')}
        </>
      );
  }
};
```

## API

### app

#### &lt;AppProvider&gt;

#### useApp()

### auth

#### useUser()

#### useSignInWithPopup()

#### useSignOut()

### firestore

#### useCollection()

#### useDocument()

#### useAddDocument()

#### useUpdateDocument()

#### useSetDocument()

#### useDeleteDocument()

### storage
