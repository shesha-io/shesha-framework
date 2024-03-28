import React, { createContext, useContext, FC, PropsWithChildren, useCallback } from "react";
import { FormMode, IConfigurableFormComponent, IFlatComponentsStructure } from "../index";

export interface IParentProviderStateContext {
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
  flatComponentsStructure?: IFlatComponentsStructure;
  getChildComponents: (componentId: string) => IConfigurableFormComponent[];
}

export interface IParentProviderProps { 
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
  flatComponentsStructure?: IFlatComponentsStructure;
}

export const ParentProviderStateContext = createContext<IParentProviderStateContext>({model: {}, getChildComponents: () => null });

export function useParent(require: boolean = true) {
  const stateContext = useContext(ParentProviderStateContext);

  if (stateContext === undefined && require) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return stateContext;
}

const ParentProvider: FC<PropsWithChildren<IParentProviderProps>> = (props) => {
  const { 
    children,
    subFormIdPrefix,
    model,
    formMode,
    context,
    flatComponentsStructure
  } = props;

  const parent = useParent(false);

  const getChildComponents = useCallback((componentId: string): IConfigurableFormComponent[] => {
    if (!!flatComponentsStructure) {
      const childIds = flatComponentsStructure.componentRelations[componentId];
      if (!childIds) return [];
      const components = childIds.map((childId) => {
        return flatComponentsStructure.allComponents[childId];
      });
      return components;
    }
    return null;
  }, [flatComponentsStructure]);

  const value: IParentProviderStateContext = {
    formMode: formMode ?? parent?.formMode,
    subFormIdPrefix: subFormIdPrefix ?? parent?.subFormIdPrefix,
    context,
    flatComponentsStructure: flatComponentsStructure ?? parent?.flatComponentsStructure,
    model: {...parent?.model, ...model},
    getChildComponents
  };

  return (
    <ParentProviderStateContext.Provider value={value}>
      {children}
    </ParentProviderStateContext.Provider>
  );
};

export default ParentProvider;