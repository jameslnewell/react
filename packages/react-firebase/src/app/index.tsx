import * as React from 'react';
import {FirebaseApp} from 'firebase/app';

const Context = React.createContext<FirebaseApp | undefined>(undefined);

export interface ProviderProps {
  app: FirebaseApp;
  children: React.ReactNode;
}

export const Provider = ({app, children}: ProviderProps): JSX.Element => (
  <Context.Provider value={app}>{children}</Context.Provider>
);

export const useApp = (): FirebaseApp => {
  const app = React.useContext(Context);
  if (!app) {
    throw new Error('Please provide an app <Provider app={app}/>');
  }
  return app;
};
