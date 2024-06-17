import React, { useContext, FC, PropsWithChildren, useMemo } from "react";
import { FormMode, IConfigurableFormComponent, IFlatComponentsStructure } from "../index";
import { createNamedContext } from "@/utils/react";

export interface IParentProviderStateContext {
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
  formFlatMarkup?: IFlatComponentsStructure;
  getChildComponents: (componentId: string) => IConfigurableFormComponent[];
}

export interface IParentProviderProps { 
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
  formFlatMarkup?: IFlatComponentsStructure;
}

export const ParentProviderStateContext = createNamedContext<IParentProviderStateContext>({model: {}, getChildComponents: () => null }, "ParentProviderStateContext");

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
    formFlatMarkup,
  } = props;

  const parent = useParent(false);

  const formModeLocal = formMode ?? parent?.formMode;
  const subFormIdPrefixLocal = subFormIdPrefix ?? parent?.subFormIdPrefix;
  const formFlatMarkupLocal = formFlatMarkup ?? parent?.formFlatMarkup;
  const contextLocal = context ?? parent?.context;

  const value: IParentProviderStateContext = useMemo(() => {
    return {
      formMode: formModeLocal,
      subFormIdPrefix: subFormIdPrefixLocal,
      context: contextLocal,
      flatComponentsStructure: formFlatMarkupLocal,
      model: {...parent?.model, ...model},
      getChildComponents: (componentId: string): IConfigurableFormComponent[] => {
        if (!!value.formFlatMarkup) {
          const childIds = value.formFlatMarkup.componentRelations[componentId];
          if (!childIds) return [];
          const components = childIds.map((childId) => {
            return value.formFlatMarkup.allComponents[childId];
          });
          return components;
        }
        return null;
      },
    };
  }, [formModeLocal, subFormIdPrefixLocal, contextLocal, formFlatMarkupLocal, model, parent?.model]);

  return (
    <ParentProviderStateContext.Provider value={value}>
      {children}
    </ParentProviderStateContext.Provider>
  );
};

export default ParentProvider;