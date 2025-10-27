import React, { useContext, FC, PropsWithChildren, useMemo, useId, useRef, useEffect } from "react";
import { ConfigurableActionDispatcherProvider, DataContextManager, DataContextProvider, FormMode, IConfigurableFormComponent, IFlatComponentsStructure, useShaFormInstanceOrUndefined } from "../index";
import { createNamedContext } from "@/utils/react";
import ConditionalWrap from "@/components/conditionalWrapper";
import ValidateProvider from "../validateProvider";
import { IFormApi } from "../form/formApi";
import { SheshaCommonContexts } from "../dataContextManager/models";

export interface IParentProviderStateContext {
  id: string;
  formMode?: FormMode;
  subFormIdPrefix?: string;
  context?: string;
  model: any;
  formFlatMarkup?: IFlatComponentsStructure;
  formApi?: IFormApi<any>;
  getChildComponents: (componentId: string) => IConfigurableFormComponent[];
  registerChild: (input: IParentProviderStateContext) => void;
  unRegisterChild: (input: IParentProviderStateContext) => void;
}

export interface IParentProviderProps {
  name?: string;
  formMode?: FormMode;
  context?: string;
  model: any;
  formFlatMarkup?: IFlatComponentsStructure | undefined;
  formApi?: IFormApi<any>;
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

export function useParent(require: boolean = true): IParentProviderStateContext | undefined {
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
    formApi,
    isScope = false,
  } = props;

  const form = useShaFormInstanceOrUndefined();
  const parent = useParent(false);
  const id = useId();

  const childParentProvider = useRef<IParentProviderStateContext[]>([]);
  const formModeLocal = formMode ?? parent?.formMode;
  const formFlatMarkupLocal = formFlatMarkup ?? (isScope ? form.flatStructure : parent?.formFlatMarkup);
  const formApiLocal = formApi ?? (isScope ? form.getPublicFormApi() : parent?.formApi);
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

  const registerChild = (input: IParentProviderStateContext): void => {
    const exists = childParentProvider.current.find((item) => item.id === input.id);
    if (!exists)
      childParentProvider.current = [...childParentProvider.current, input];
    else
      childParentProvider.current = childParentProvider.current.map((item) => {
        return item.id === input.id ? input : item;
      });
  };

  const unRegisterChild = (input: IParentProviderStateContext): void => {
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
      formApi: formApiLocal,
      model: { ...parent?.model, ...model },
      getChildComponents,
      registerChild,
      unRegisterChild,
    };
  }, [
    formModeLocal, contextLocal, formFlatMarkupLocal, formApiLocal, model,
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
                <DataContextProvider
                  id={id}
                  name={SheshaCommonContexts.FormContext}
                  type="form"
                  webStorageType="sessionStorage"
                  description={`${props.name || id}`}
                >
                  {children}
                </DataContextProvider>
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
