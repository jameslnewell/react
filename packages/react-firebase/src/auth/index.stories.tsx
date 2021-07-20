import React from 'react';
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {useResource} from '@jameslnewell/react-observable';
import {RenderJSON, withSuspense} from 'testing-utilities';
import {decorator} from '../__utilities__/decorator';
import {
  createStatusResource,
  createUserResource,
  useSignInWithPopup,
  useSignOut,
} from '.';

const auth = getAuth();

export default {
  title: 'react-firebase/auth',
  decorators: [decorator],
};

const statusResource = createStatusResource(auth);
export const Status: React.FC = withSuspense()(() => {
  const status = useResource(statusResource);
  return <RenderJSON value={status} />;
});

const userResource = createUserResource(auth);
export const User: React.FC = withSuspense()(() => {
  const user = useResource(userResource);
  return <RenderJSON value={user} />;
});

export const SignInWithPopup: React.FC = () => {
  const {invoke: signIn} = useSignInWithPopup();
  return (
    <>
      <button onClick={() => signIn(new GoogleAuthProvider())}>Sign in</button>
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
