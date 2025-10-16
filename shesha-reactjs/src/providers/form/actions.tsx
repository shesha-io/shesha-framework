import React, { FC, PropsWithChildren, useContext } from 'react';
import { IFormActions } from './models';
import { createNamedContext } from '@/utils/react';

export interface ConfigurableFormActionsProviderProps {
  actions?: IFormActions;
}

export const ConfigurableFormActionsContext = createNamedContext<IFormActions>(undefined, "ConfigurableFormActionsContext");

export const ConfigurableFormActionsProvider: FC<PropsWithChildren<ConfigurableFormActionsProviderProps>> = ({ actions, children }) => {
  return (
    <ConfigurableFormActionsContext.Provider value={actions}>
      { children }
    </ConfigurableFormActionsContext.Provider>
  );
};

export const useConfigurableFormActions = (required: boolean = true): IFormActions => {
  const context = useContext(ConfigurableFormActionsContext);

  if (required && context === undefined) {
    throw new Error('useConfigurableFormActions must be used within a ConfigurableFormActionsProvider');
  }

  return context;
};
