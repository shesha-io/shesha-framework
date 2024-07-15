import React, { useContext, FC, PropsWithChildren, useMemo, useId } from "react";
import { ConfigurableActionDispatcherProvider, DataContextManager, FormMode, IConfigurableFormComponent, IFlatComponentsStructure } from "../index";
import { createNamedContext } from "@/utils/react";
import ConditionalWrap from "@/components/conditionalWrapper";

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
  context?: string;
  model: any;
  formFlatMarkup?: IFlatComponentsStructure;
  isScope?: boolean;
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
    model,
    formMode,
    context,
    formFlatMarkup,
    isScope = false,
  } = props;

  const parent = useParent(false);
  const id = useId();

  const formModeLocal = formMode ?? parent?.formMode;
  const formFlatMarkupLocal = formFlatMarkup ?? parent?.formFlatMarkup;
  const contextLocal = context ?? parent?.context;

  const value = useMemo((): IParentProviderStateContext => {
    return {
      formMode: formModeLocal,
      context: contextLocal,
      formFlatMarkup: formFlatMarkupLocal,
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
      }
    };
  }, [formModeLocal, contextLocal, formFlatMarkupLocal, model, parent?.model]);

  return (
    <ConditionalWrap 
      condition={isScope} 
      wrap={(children: React.ReactNode) => {
        return (
          <DataContextManager id={id}>
            <ConfigurableActionDispatcherProvider>
              {children}
            </ConfigurableActionDispatcherProvider>
          </DataContextManager>
        );
      }}
    >
      <ParentProviderStateContext.Provider value={value}>
        {children}
      </ParentProviderStateContext.Provider>
    </ConditionalWrap>
  );
};

export default ParentProvider;