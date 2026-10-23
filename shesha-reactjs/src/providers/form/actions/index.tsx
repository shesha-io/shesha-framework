import { FC, PropsWithChildren, useContext } from 'react';
import { IFormActions } from '../models';
import { createNamedContext } from '@/utils/react';

export interface ConfigurableFormActionsProviderProps {
  actions?: IFormActions | undefined;
}

const ConfigurableFormActionsContext = createNamedContext<IFormActions | undefined>(undefined, "ConfigurableFormActionsContext");

export const ConfigurableFormActionsProvider: FC<PropsWithChildren<ConfigurableFormActionsProviderProps>> = ({ actions, children }) => {
  return (
    <ConfigurableFormActionsContext.Provider value={actions}>
      {children}
    </ConfigurableFormActionsContext.Provider>
  );
};

export const useConfigurableFormActionsOrUndefined = (): IFormActions | undefined => useContext(ConfigurableFormActionsContext);
