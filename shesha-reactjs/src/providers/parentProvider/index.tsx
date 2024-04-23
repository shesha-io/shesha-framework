import React, { createContext, useContext, FC, PropsWithChildren, useMemo } from "react";
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

  const formModeLocal = formMode ?? parent?.formMode;
  const subFormIdPrefixLocal = subFormIdPrefix ?? parent?.subFormIdPrefix;
  const flatComponentsStructureLocal = flatComponentsStructure ?? parent?.flatComponentsStructure;

  const value: IParentProviderStateContext = useMemo(() => {
    return {
      formMode: formModeLocal,
      subFormIdPrefix: subFormIdPrefixLocal,
      context,
      flatComponentsStructure: flatComponentsStructureLocal,
      model: {...parent?.model, ...model},
      getChildComponents: (componentId: string): IConfigurableFormComponent[] => {
        if (!!value.flatComponentsStructure) {
          const childIds = value.flatComponentsStructure.componentRelations[componentId];
          if (!childIds) return [];
          const components = childIds.map((childId) => {
            return value.flatComponentsStructure.allComponents[childId];
          });
          return components;
        }
        return null;
      },
    };
  }, [formModeLocal, subFormIdPrefixLocal, context, flatComponentsStructureLocal, model, parent?.model]);

  return (
    <ParentProviderStateContext.Provider value={value}>
      {children}
    </ParentProviderStateContext.Provider>
  );
};

export default ParentProvider;