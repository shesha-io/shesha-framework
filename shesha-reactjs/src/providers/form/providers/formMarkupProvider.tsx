import React, { FC, PropsWithChildren, useContext, useMemo } from 'react';
import { IConfigurableFormComponent, IFlatComponentsStructure, isConfigurableFormComponent } from '../models';
import { createNamedContext } from '@/utils/react';

export interface IFormFlatMarkupProviderProps {
  markup: IFlatComponentsStructure;
}

export const FormFlatMarkupContext = createNamedContext<IFlatComponentsStructure>(undefined, "FormFlatMarkupContext");

export const FormFlatMarkupProvider: FC<PropsWithChildren<IFormFlatMarkupProviderProps>> = ({ children, markup }) => {
  return (
    <FormFlatMarkupContext.Provider value={markup}>
      {children}
    </FormFlatMarkupContext.Provider>
  );
};

export const useFormMarkup = (require: boolean = true): IFlatComponentsStructure | undefined => {
  const context = useContext(FormFlatMarkupContext);

  if (require && context === undefined) {
    throw new Error('useFormMarkup must be used within a FormFlatMarkupProvider');
  }

  return context;
};

/** Returns component model by component id  */
export const useComponentModel = (id: string): IConfigurableFormComponent => {
  const markup = useFormMarkup();
  const component = markup.allComponents[id];
  if (!isConfigurableFormComponent(component))
    throw new Error(`Component with id ${id} is not found`);

  return component;
};

export const useChildComponents = (containerId: string): IConfigurableFormComponent[] => {
  const markup = useFormMarkup();

  const result = useMemo(() => {
    const { componentRelations, allComponents } = markup;
    const childIds = componentRelations[containerId];
    if (!childIds)
      return [];
    const components: IConfigurableFormComponent[] = [];
    childIds.forEach((childId) => {
      const component = allComponents[childId];
      if (isConfigurableFormComponent(component))
        components.push(component);
    });
    return components;
  }, [markup, containerId]);

  return result;
};

export const useChildComponentIds = (containerId: string): string[] => {
  const { componentRelations } = useFormMarkup();
  const childIds = componentRelations[containerId];
  return childIds ?? [];
};
