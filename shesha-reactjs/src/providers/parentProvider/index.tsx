import React, { useContext, FC, PropsWithChildren, useMemo, useId, useRef, useEffect } from "react";
import { ConfigurableActionDispatcherProvider, DataContextManager, FormMode, IConfigurableFormComponent, IFlatComponentsStructure } from "../index";
import { createNamedContext } from "@/utils/react";
import ConditionalWrap from "@/components/conditionalWrapper";
import ValidateProvider from "../validateProvider";

export interface IParentProviderStateContext {
  id: string;
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
  formFlatMarkup?: IFlatComponentsStructure;
  getChildComponents: (componentId: string) => IConfigurableFormComponent[];
  registerChild: (input: IParentProviderStateContext) => void;
  unRegisterChild: (input: IParentProviderStateContext) => void;
}

export interface IParentProviderProps { 
  formMode?: FormMode;
  context?: string;
  model: any;
  formFlatMarkup?: IFlatComponentsStructure;
  isScope?: boolean;
}

export const ParentProviderStateContext = createNamedContext<IParentProviderStateContext>(
  {
    id: '',
    model: {},
    getChildComponents: () => undefined,
    registerChild: () => undefined,
    unRegisterChild: () => undefined,
  },
  "ParentProviderStateContext");

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

  const childParentProvider = useRef<IParentProviderStateContext[]>([]);

  const formModeLocal = formMode ?? parent?.formMode;
  const formFlatMarkupLocal = formFlatMarkup ?? parent?.formFlatMarkup;
  const contextLocal = context ?? parent?.context;

  const getChildComponents = (componentId: string): IConfigurableFormComponent[] => {
    if (!!formFlatMarkupLocal) {
      const childIds = formFlatMarkupLocal.componentRelations[componentId];
      if (!childIds) return [];
      const components = childIds.map((childId) => {
        return formFlatMarkupLocal.allComponents[childId];
      });
      return components;
    }
    return null;
  };

  const registerChild = (input: IParentProviderStateContext) => {
    const exists = childParentProvider.current.find((item) => item.id === input.id);
    if (!exists)
      childParentProvider.current = [...childParentProvider.current, input];
    else
      childParentProvider.current = childParentProvider.current.map((item) =>{
        return item.id === input.id ? input : item;
      });
  };

  const unRegisterChild = (input: IParentProviderStateContext) => {
    const existsPos = childParentProvider.current.findIndex((item) => item.id === input.id);
    if (existsPos > -1)
      childParentProvider.current.splice(existsPos, 1);
  };

  const value = useMemo((): IParentProviderStateContext => {
    return {
      id,
      formMode: formModeLocal,
      context: contextLocal,
      formFlatMarkup: formFlatMarkupLocal,
      model: {...parent?.model, ...model},
      getChildComponents,
      registerChild,
      unRegisterChild,
    };
  }, [
    formModeLocal, contextLocal, formFlatMarkupLocal, model,
    parent?.model, childParentProvider.current,
  ]);

  useEffect(() => {
    if (parent) {
      parent.registerChild(value);
    }
    return () => {
      if (parent)
        parent.unRegisterChild(value);
    };
  }, [value]);

  return (
    <ConditionalWrap 
      condition={isScope} 
      wrap={(children: React.ReactNode) => {
        return (
          <ValidateProvider>
            <DataContextManager id={id}>
              <ConfigurableActionDispatcherProvider>
                {children}
              </ConfigurableActionDispatcherProvider>
            </DataContextManager>
          </ValidateProvider>
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