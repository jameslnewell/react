import {useContext} from 'react';
import * as firebase from 'firebase';
import {Context} from './Context';

export const useApp = (): firebase.app.App => {
  const app = useContext(Context);
  if (!app) {
    throw new Error('Please set an app <Provider app={app}/>.');
  }
  return app;
};
