import React, { FC, PropsWithChildren, useContext } from 'react';
import { IFormActions } from '../models';
import { createNamedContext } from '@/utils/react';
import { throwError } from '@/utils/errors';

export interface ConfigurableFormActionsProviderProps {
  actions?: IFormActions | undefined;
}

export const ConfigurableFormActionsContext = createNamedContext<IFormActions | undefined>(undefined, "ConfigurableFormActionsContext");

export const ConfigurableFormActionsProvider: FC<PropsWithChildren<ConfigurableFormActionsProviderProps>> = ({ actions, children }) => {
  return (
    <ConfigurableFormActionsContext.Provider value={actions}>
      {children}
    </ConfigurableFormActionsContext.Provider>
  );
};

export const useConfigurableFormActionsOrUndefined = (): IFormActions | undefined => useContext(ConfigurableFormActionsContext);

export const useConfigurableFormActions = (): IFormActions => useConfigurableFormActionsOrUndefined() ?? throwError('useConfigurableFormActions must be used within a ConfigurableFormActionsProvider');
