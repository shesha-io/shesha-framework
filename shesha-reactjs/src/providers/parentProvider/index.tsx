import React, { useContext, PropsWithChildren, useMemo, useId } from "react";
import { ConfigurableActionDispatcherProvider, DataContextManager, DataContextProvider, FormMode, IConfigurableFormComponent, IDataContextProviderProps, IFlatComponentsStructure, isConfigurableFormComponent, useShaFormInstanceOrUndefined } from "../index";
import { createNamedContext } from "@/utils/react";
import ConditionalWrap from "@/components/conditionalWrapper";
import ValidateProvider from "../validateProvider";
import { IFormApi } from "../form/formApi";
import { SheshaCommonContexts } from "../dataContextManager/models";
import { throwError } from "@/utils/errors";
import { isDefined } from "@/utils/nullables";

export interface IParentProviderStateContext<Values extends object = object> {
  id: string;
  formMode?: FormMode | undefined;
  subFormIdPrefix?: string | undefined;
  context?: string | undefined;
  model: Values;
  formFlatMarkup?: IFlatComponentsStructure | undefined;
  formApi?: IFormApi<Values> | undefined;
  getChildComponents: (componentId: string) => IConfigurableFormComponent[];
}

export interface IParentProviderProps<TValue extends object = object> {
  name?: string | undefined;
  formMode?: FormMode | undefined;
  context?: string | undefined;
  model: TValue | undefined;
  formFlatMarkup?: IFlatComponentsStructure | undefined;
  formApi?: IFormApi<TValue> | undefined;
  isScope?: boolean | undefined;
  addContext?: boolean | undefined;
  contextProps?: IDataContextProviderProps<object> | undefined;
}

export const ParentProviderStateContext = createNamedContext<IParentProviderStateContext>(
  {
    id: '',
    model: {},
    getChildComponents: () => [],
  },
  "ParentProviderStateContext");

export const useParentOrUndefined = (): IParentProviderStateContext | undefined => useContext(ParentProviderStateContext);

export const useParent = (): IParentProviderStateContext => useParentOrUndefined() ?? throwError("useParent must be used within a ParentProvider");

const getChildComponents = (formFlatMarkup: IFlatComponentsStructure, componentId: string): IConfigurableFormComponent[] => {
  if (isDefined(formFlatMarkup)) {
    const childIds = formFlatMarkup.componentRelations[componentId];
    if (!childIds) return [];
    const components: IConfigurableFormComponent[] = [];
    childIds.forEach((childId) => {
      if (isConfigurableFormComponent(formFlatMarkup.allComponents[childId]))
        components.push(formFlatMarkup.allComponents[childId]);
    });
    return components;
  }
  return [];
};

const ParentProvider = <TValue extends object = object>(props: PropsWithChildren<IParentProviderProps<TValue>>): React.ReactElement => {
  const {
    children,
    model,
    formMode,
    context,
    formFlatMarkup,
    formApi,
    isScope = false,
    addContext = true,
  } = props;

  const form = useShaFormInstanceOrUndefined();
  const parent = useParentOrUndefined();
  const id = useId();

  const formModeLocal = formMode ?? parent?.formMode;
  const formFlatMarkupLocal = formFlatMarkup ?? (isScope ? form?.flatStructure : parent?.formFlatMarkup);
  const formApiLocal = formApi ?? (isScope ? form?.getPublicFormApi() : parent?.formApi);
  const contextLocal = context ?? parent?.context;

  const value = useMemo((): IParentProviderStateContext => {
    return {
      id,
      formMode: formModeLocal ?? "readonly",
      context: contextLocal,
      formFlatMarkup: formFlatMarkupLocal,
      formApi: formApiLocal as IFormApi<object>,
      model: { ...parent?.model, ...model },
      getChildComponents: (id) => formFlatMarkupLocal ? getChildComponents(formFlatMarkupLocal, id) : [],
    };
  }, [
    id,
    formModeLocal,
    contextLocal,
    formFlatMarkupLocal,
    formApiLocal,
    model,
    parent?.model,
  ]);

  const contextProps: IDataContextProviderProps<object> | undefined = addContext && !props.contextProps
    ? { id, name: SheshaCommonContexts.FormContext, type: "form", webStorageType: "sessionStorage", description: `${props.name || id}` }
    : props.contextProps;

  return (
    <ConditionalWrap
      condition={isScope}
      wrap={(children: React.ReactNode) => {
        return (
          <ValidateProvider>
            <DataContextManager id={id}>
              <ConfigurableActionDispatcherProvider>
                {addContext && contextProps
                  ? <DataContextProvider {...contextProps}>{children}</DataContextProvider>
                  : children}
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
