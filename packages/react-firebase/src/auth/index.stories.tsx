import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import {decorator} from '../__utilities__/decorator';
import {useUser, useSignInWithPopup, useSignOut} from '.';
import {RenderJSON} from 'testing-utilities';

export default {
  title: 'react-firebase/auth',
  decorators: [decorator],
};

export const Status: React.FC = () => {
  const {status} = useUser();
  return <RenderJSON value={status} />;
};

export const User: React.FC = () => {
  const {value: user} = useUser();
  return <RenderJSON value={user} />;
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
  return (
    <>
      <button onClick={signOut}>Sign out</button>
    </>
  );
};
