import React from 'react';
import {getApp, FirebaseApp} from 'firebase/app';

const Context = React.createContext<FirebaseApp>(getApp());

export interface ProviderProps {
  app: FirebaseApp;
  children: React.ReactNode;
}

export const Provider = ({app, children}: ProviderProps): JSX.Element => (
  <Context.Provider value={app}>{children}</Context.Provider>
);

export const useApp = (): FirebaseApp => {
  return React.useContext(Context);
};
