import React, { FC, PropsWithChildren } from 'react';
import { ApplicationDataProvider } from './applicationContext';

export const ApplicationContextsProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ApplicationDataProvider>
      {children}
    </ApplicationDataProvider>
  );
};
