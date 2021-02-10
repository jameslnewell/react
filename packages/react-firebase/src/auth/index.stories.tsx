import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import {decorator} from '../__utilities__/decorator';
import {useUser, useSignInWithPopup, useSignOut} from '.';

export default {
  title: 'react-firebase/auth',
  decorators: [decorator],
};

export const Status: React.FC = () => {
  const {status} = useUser();
  return <pre>{status}</pre>;
};

export const User: React.FC = () => {
  const {value: user} = useUser();
  return <pre>{JSON.stringify(user)}</pre>;
};

export const SignInWithPopup: React.FC = () => {
  const {invoke: signIn} = useSignInWithPopup();
  return (
    <>
      <button onClick={() => signIn(new firebase.auth.GoogleAuthProvider())}>
        Sign in
      </button>
    </>
  );
};

export const SignOut: React.FC = () => {
  const {invoke: signOut} = useSignOut();
  console.log(signOut);
  return (
    <>
      <button onClick={signOut}>Sign out</button>
    </>
  );
};
