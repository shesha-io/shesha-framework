import React, { FC, PropsWithChildren } from 'react';
import { ApplicationDataProvider } from './applicationContext';

export interface IApplicationDataProviderProps {

}

export const ApplicationContextsProvider: FC<PropsWithChildren<IApplicationDataProviderProps>> = ({ children }) => {
  return (
    <ApplicationDataProvider>
      {children}
    </ApplicationDataProvider>
  );
};
