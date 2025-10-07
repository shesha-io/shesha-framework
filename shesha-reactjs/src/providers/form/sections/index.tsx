import React, { FC, PropsWithChildren, useContext } from 'react';
import { IFormSections } from '../models';
import { createNamedContext } from '@/utils/react';

export interface ConfigurableFormSectionsProviderProps {
  sections?: IFormSections;
}

export const ConfigurableFormSectionsContext = createNamedContext<IFormSections>(undefined, "ConfigurableFormSectionsContext");

export const ConfigurableFormSectionsProvider: FC<PropsWithChildren<ConfigurableFormSectionsProviderProps>> = ({ sections, children }) => {
  return (
    <ConfigurableFormSectionsContext.Provider value={sections}>
      {children}
    </ConfigurableFormSectionsContext.Provider>
  );
};

export const useConfigurableFormSections = (required: boolean = true): IFormSections => {
  const context = useContext(ConfigurableFormSectionsContext);

  if (required && context === undefined) {
    throw new Error('useConfigurableFormSections must be used within a ConfigurableFormSectionsProvider');
  }

  return context;
};
