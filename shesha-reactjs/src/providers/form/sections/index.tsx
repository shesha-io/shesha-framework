import React, { FC, PropsWithChildren, useContext } from 'react';
import { IFormSections } from '../models';
import { createNamedContext } from '@/utils/react';
import { throwError } from '@/utils/errors';

export interface ConfigurableFormSectionsProviderProps {
  sections?: IFormSections | undefined;
}

export const ConfigurableFormSectionsContext = createNamedContext<IFormSections | undefined>(undefined, "ConfigurableFormSectionsContext");

export const ConfigurableFormSectionsProvider: FC<PropsWithChildren<ConfigurableFormSectionsProviderProps>> = ({ sections, children }) => {
  return (
    <ConfigurableFormSectionsContext.Provider value={sections}>
      {children}
    </ConfigurableFormSectionsContext.Provider>
  );
};


export const useConfigurableFormSectionsOrUndefined = (): IFormSections | undefined => useContext(ConfigurableFormSectionsContext);

export const useConfigurableFormSections = (): IFormSections => useConfigurableFormSectionsOrUndefined() ?? throwError("useConfigurableFormSections must be used within a ConfigurableFormSectionsProvider");
