import React from 'react';
import {Provider} from '../app';
import {app} from './firebase';

export const wrapper: React.FC = ({children}) => (
  <Provider app={app}>{children}</Provider>
);
