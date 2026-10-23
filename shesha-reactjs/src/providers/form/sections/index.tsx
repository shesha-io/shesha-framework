import { FC, PropsWithChildren, useContext } from 'react';
import { IFormSections } from '../models';
import { createNamedContext } from '@/utils/react';

export interface ConfigurableFormSectionsProviderProps {
  sections?: IFormSections | undefined;
}

const ConfigurableFormSectionsContext = createNamedContext<IFormSections | undefined>(undefined, "ConfigurableFormSectionsContext");

export const ConfigurableFormSectionsProvider: FC<PropsWithChildren<ConfigurableFormSectionsProviderProps>> = ({ sections, children }) => {
  return (
    <ConfigurableFormSectionsContext.Provider value={sections}>
      {children}
    </ConfigurableFormSectionsContext.Provider>
  );
};


export const useConfigurableFormSectionsOrUndefined = (): IFormSections | undefined => useContext(ConfigurableFormSectionsContext);
