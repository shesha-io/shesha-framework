import { FormInstance } from 'antd';
import React, { useCallback, FC, MutableRefObject, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import useThunkReducer from '@/hooks/thunkReducer';
import {
  IComponentRelations,
  IComponentsDictionary,
  IConfigurableFormComponent,
  IFormValidationErrors,
  IDictionary,
} from '@/interfaces';
import { DelayedUpdateProvider, useDelayedUpdate } from '@/providers/delayedUpdateProvider';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  registerComponentActionsAction,
  setEnabledComponentsAction,
  setFormControlsDataAction,
  setFormDataAction,
  setFormModeAction,
  setSettingsAction,
  setValidationErrorsAction,
  setVisibleComponentsAction,
} from './actions';
import {
  ConfigurableFormInstance,
  FORM_CONTEXT_INITIAL_STATE,
  FormActionsContext,
  FormStateContext,
  IFormActionsContext,
  IFormStateInternalContext,
  ISetEnabledComponentsPayload,
  ISetFormControlsDataPayload,
  ISetFormDataPayload,
  ISetVisibleComponentsPayload,
} from './contexts';
import { useFormDesignerComponents } from './hooks';
import { FormMode, FormRawMarkup, IFormActions, IFormSections, IFormSettings, ISubmitActionArguments, Store } from './models';
import formReducer from './reducer';
import { convertActions, convertSectionsToList, evaluateKeyValuesToObjectMatchedData, executeScript, getComponentNames, getEnabledComponentIds, getFilteredComponentIds, getSheshaFormUtils, getVisibleComponentIds, useFormProviderContext } from './utils';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useDeepCompareMemo } from '@/index';
import cleanDeep from 'clean-deep';
import { useDataContextManager } from '@/providers/dataContextManager/index';
import { SheshaCommonContexts } from '../dataContextManager/models';
import { addFormFieldsList, removeGhostKeys } from '@/utils/form';
import { filterDataByOutputComponents } from './api';
import { IDataSourceComponent } from '@/components/configurableForm/models';
import { hasPreviousActionError } from '@/interfaces/configurableAction';
import { getFormApi } from './formApi';

export interface IFormProviderProps {
  needDebug?: boolean;
  name: string;
  allComponents: IComponentsDictionary;
  componentRelations: IComponentRelations;

  formSettings: IFormSettings;
  formMarkup?: FormRawMarkup;
  mode: FormMode;
  form?: FormInstance<any>;
  actions?: IFormActions;
  sections?: IFormSections;
  context?: any; // todo: make generic
  formRef?: MutableRefObject<Partial<ConfigurableFormInstance> | null>;
  onValuesChange?: (changedValues: any, values: any /*Values*/) => void;
  /**
   * External data fetcher, is used to refresh form data from the back-end.
   */
  refetchData?: () => Promise<any>;
  /**
   * If true, form should register configurable actions. Should be enabled for main forms only
   */
  isActionsOwner: boolean;

  propertyFilter?: (name: string) => boolean;
  initialValues?: Store;
  parentFormValues?: Store;
}

const FormProviderInternal: FC<PropsWithChildren<IFormProviderProps>> = ({
  name,
  children,
  allComponents,
  componentRelations,
  mode = 'readonly',
  form,
  actions,
  sections,
  context,
  formRef,
  formSettings,
  formMarkup,
  refetchData,
  isActionsOwner,
  propertyFilter,
  needDebug,
  ...props
}) => {

  const initial: IFormStateInternalContext = {
    ...FORM_CONTEXT_INITIAL_STATE,
    name: name,
    formMode: mode,
    form,
    actions: convertActions(null, actions),
    sections: convertSectionsToList(null, sections),
    context,
    formSettings: formSettings,
    formMarkup: formMarkup,
  };

  let configurableFormActions: IFormActionsContext = null;

  const [state, dispatch] = useThunkReducer(formReducer, initial);

  const toolboxComponents = useFormDesignerComponents();

  const formProviderContext = useFormProviderContext();

  const filteredComponents = useRef<string[]>();

  filteredComponents.current = useDeepCompareMemo(() => {
    return getFilteredComponentIds(
      allComponents,
      propertyFilter
    );
  }, [allComponents, propertyFilter]);

  const isComponentFiltered = (component: IConfigurableFormComponent): boolean => {
    return filteredComponents.current?.includes(component.id);
  };

  const getToolboxComponent = useCallback((type: string) => toolboxComponents[type], [toolboxComponents]);

  //#region data fetcher

  const fetchData = (): Promise<any> => {
    return refetchData ? refetchData() : Promise.reject('fetcher not specified');
  };

  //#endregion

  const setFormMode = (formMode: FormMode) => {
    dispatch(setFormModeAction(formMode));
  };

  const setSettings = (settings: IFormSettings) => {
    dispatch(setSettingsAction(settings));
  };

  useEffect(() => {
    if (formSettings !== state.formSettings) {
      setSettings(formSettings);
    }
  }, [formSettings]);

  useEffect(() => {
    if (mode !== state.formMode) {
      setFormMode(mode);
    }
  }, [mode]);

  const getComponentModel = (componentId) => {
    return allComponents[componentId];
  };

  const isComponentReadOnly = (model: Pick<IConfigurableFormComponent, 'id' | 'isDynamic'>): boolean => {
    const disabledByCondition = model.isDynamic !== true && state.enabledComponentIds && !state.enabledComponentIds.includes(model.id);

    return state.formMode !== 'designer' && disabledByCondition;
  };

  const isComponentHidden = (model: Pick<IConfigurableFormComponent, 'id' | 'isDynamic'>): boolean => {
    const hiddenByCondition = model.isDynamic !== true && state.visibleComponentIds && !state.visibleComponentIds.includes(model.id);

    return state.formMode !== 'designer' && hiddenByCondition;
  };

  const getChildComponents = (componentId: string) => {
    const childIds = componentRelations[componentId];
    if (!childIds) return [];
    const components = childIds.map((childId) => {
      return allComponents[childId];
    });
    return components;
  };

  const getChildComponentIds = (containerId: string): string[] => {
    const childIds = componentRelations[containerId];
    return childIds ?? [];
  };

  const setVisibleComponents = (payload: ISetVisibleComponentsPayload) => {
    dispatch(setVisibleComponentsAction(payload));
  };

  const setValidationErrors = (payload: IFormValidationErrors) => {
    dispatch(setValidationErrorsAction(payload));
  };

  //#region configurable actions

  const actionsOwnerUid = isActionsOwner ? SheshaActionOwners.Form : null;
  const actionDependencies = [actionsOwnerUid];

  useConfigurableAction(
    {
      name: 'Start Edit',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        setFormMode('edit');
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Cancel Edit',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        setFormMode('readonly');
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Submit',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      //argumentsFormMarkup: SubmitActionArgumentsMarkup,
      executer: async (args: ISubmitActionArguments, actionContext) => {
        var formInstance = (actionContext?.form?.formInstance ?? form) as FormInstance<any>;
        var fieldsToValidate = actionContext?.fieldsToValidate ?? null;
        if (args?.validateFields === true || fieldsToValidate?.length > 0) {
          await formInstance.validateFields(fieldsToValidate);
        }
        formInstance.submit();
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Reset',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: (_, actionContext) => {
        var formInstance = actionContext?.form?.formInstance ?? form;
        formInstance.resetFields();
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Refresh',
      description: 'Refresh the form data by fetching it from the back-end',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        return fetchData();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Validate',
      description: 'Validate the form data and show validation errors if any',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: async (_, actionContext) => {
        var formInstance = actionContext?.form?.formInstance ?? form;
        var fieldsToValidate = actionContext?.fieldsToValidate ?? null;
        await formInstance.validateFields(fieldsToValidate);
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction<{ data: object }>(
    {
      name: 'Set validation errors',
      description: 'Errors are displayed on the Validation Errors component attached to the form',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: async (_args, actionContext) => {
        if (hasPreviousActionError(actionContext)){
          const error = actionContext.actionError instanceof Error
            ? { message: actionContext.actionError.message }
            : actionContext.actionError;

          setValidationErrors(error);
        }

        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Reset validation errors',
      description: 'Clear errors displayed on the Validation Errors component attached to the form',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: async () => {
        setValidationErrors(undefined);
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  //#endregion

  const updateVisibleComponents = (formContext: IFormStateInternalContext, formActionsContext: IFormActionsContext) => {

    const visibleComponents = getVisibleComponentIds(
      allComponents,
      {
        ...formProviderContext,
        data: formContext.formData,
        form: getFormApi({...formContext, ...formActionsContext} as ConfigurableFormInstance)
      },
      filteredComponents.current
    );
    setVisibleComponents({ componentIds: visibleComponents });
  };

  const debouncedUpdateVisibleComponents = 
    useDebouncedCallback<(context: IFormStateInternalContext, formActionsContext: IFormActionsContext) => void>(
      (formContext, formActionsContext) => {
        updateVisibleComponents(formContext,formActionsContext);
      },
      // delay in ms
      200
    );

  //#region Set enabled components
  const setEnabledComponents = (payload: ISetEnabledComponentsPayload) => {
    dispatch(setEnabledComponentsAction(payload));
  };

  const updateEnabledComponents = (formContext: IFormStateInternalContext, formActionsContext: IFormActionsContext) => {
    const enabledComponents = getEnabledComponentIds(
      allComponents,
      {
        ...formProviderContext,
        data: formContext.formData,
        form: getFormApi({...formContext, ...formActionsContext} as ConfigurableFormInstance)
      }
    );

    setEnabledComponents({ componentIds: enabledComponents });
  };

  const debouncedUpdateEnabledComponents = 
    useDebouncedCallback<(context: IFormStateInternalContext, formActionsContext: IFormActionsContext) => void>(
      (formContext, formActionsContext) => {
        updateEnabledComponents(formContext, formActionsContext);
      },
      // delay in ms
      200
    );
  //#endregion

  useDeepCompareEffect(() => {
    dispatch((_, getState) => {
      const newState = getState();

      // Here there's always visibleComponentIds and enabledComponentIds
      debouncedUpdateVisibleComponents(newState, configurableFormActions);
      debouncedUpdateEnabledComponents(newState, configurableFormActions);
    });
  }, [state.formMode, formProviderContext.globalState, formProviderContext.contexts.lastUpdate]);

  useDeepCompareEffect(() => {
    dispatch((_, getState) => {
      const newState = getState();

      // Here there's always visibleComponentIds and enabledComponentIds
      updateVisibleComponents(newState, configurableFormActions);
      updateEnabledComponents(newState, configurableFormActions);
    });
  }, [allComponents, componentRelations]);

  useEffect(() => {
    // initialise state.formData if Antd form has values
    // ToDo: Review on next version of Antd
    const values = form?.getFieldValue([]);
    if (!state.formData && !!values) {
      dispatch(setFormDataAction({ values, mergeValues: true }));
    }
  }, []);

  const setFormControlsData = (payload: ISetFormControlsDataPayload) => {
    dispatch(setFormControlsDataAction(payload));
  };

  const updateStateFormData = (payload: ISetFormDataPayload) => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(setFormDataAction(payload));
      const newState = getState();

      if (typeof props.onValuesChange === 'function')
        props.onValuesChange(payload.values, newState.formData);

      // Update visible components. Note: debounced version is used to improve performance and prevent unneeded re-rendering

      if (!newState.visibleComponentIds || newState.visibleComponentIds.length === 0) {
        updateVisibleComponents(newState, configurableFormActions);
      } else {
        debouncedUpdateVisibleComponents(newState, configurableFormActions);
      }
      // Update enabled components. Note: debounced version is used to improve performance and prevent unneeded re-rendering
      if (!newState.enabledComponentIds || newState.enabledComponentIds.length === 0) {
        updateEnabledComponents(newState, configurableFormActions);
      } else {
        debouncedUpdateEnabledComponents(newState, configurableFormActions);
      }
    });
  };

  const setFormData = (payload: ISetFormDataPayload) => {
    updateStateFormData(payload);

    if (payload?.mergeValues) {
      form?.setFieldsValue(payload?.values);
    } else {
      form?.resetFields();
      form?.setFieldsValue(payload?.values);
    }
  };

  //#region form actions
  const registerActions = (ownerId: string, actionsToRegister: IFormActions) => {
    dispatch(registerComponentActionsAction({ id: ownerId, actions: actionsToRegister }));
  };

  const getAction = (componentId: string, name: string) => {
    // search requested action in all parents and fallback to form
    let currentId = componentId;
    do {
      const component = allComponents[currentId];

      const action = state.actions.find((a) => a.owner === (component?.parentId ?? null) && a.name === name);
      if (action) return (data, parameters) => action.body(data, parameters);

      currentId = component?.parentId;
    } while (currentId);

    return null;
  };
  //#endregion

  const getSection = (componentId: string, name: string) => {
    // search requested section in all parents and fallback to form
    let currentId = componentId;

    do {
      const component = allComponents[currentId];

      const section = state.sections.find((a) => a.owner === (component?.parentId ?? null) && a.name === name);
      if (section) return (data) => section.body(data);

      currentId = component?.parentId;
    } while (currentId);

    return null;
  };

  const hasVisibleChilds = (id: string): boolean => {
    const childs = getChildComponents(id);
    const visibleChildIndex = childs.findIndex((component) => !isComponentHidden(component));

    return visibleChildIndex !== -1;
  };

  const dcm = useDataContextManager(false);

  const executeExpression = <TResult = any>(
    expression: string,
    exposedData = null
  ): Promise<TResult> => {
    if (!expression) {
      return null;
    }

    const application = dcm?.getDataContext(SheshaCommonContexts.ApplicationContext);
    const pageContext = dcm.getPageContext();

    const callArguments: IDictionary<any> = {
      application: application?.getData(),
      contexts: { ...dcm?.getDataContextsData(), lastUpdate: dcm?.lastUpdate },
      data: exposedData || state.formData,
      form: getFormApi({...state, setFormData} as ConfigurableFormInstance),
      globalState: formProviderContext.globalState,
      http: formProviderContext.http,
      initialValues: props.initialValues,
      message: formProviderContext.message,
      moment: formProviderContext.moment,
      pageContext: pageContext?.getFull(),
      parentFormValues: props.parentFormValues,
      setGlobalState: formProviderContext.setGlobalState,
      shesha: getSheshaFormUtils(formProviderContext.http),
    };

    return executeScript<TResult>(expression, callArguments);
  };

  const getInitialValuesFromFormSettings = () => {
    const initialValuesFromFormSettings = state.formSettings?.initialValues;

    const values = evaluateKeyValuesToObjectMatchedData(initialValuesFromFormSettings, [
      { match: 'data', data: state.formData },
      { match: 'parentFormValues', data: props.parentFormValues },
      { match: 'globalState', data: formProviderContext.globalState },
    ]);

    return cleanDeep(values, {
      // cleanKeys: [], // Don't Remove specific keys, ie: ['foo', 'bar', ' ']
      // cleanValues: [], // Don't Remove specific values, ie: ['foo', 'bar', ' ']
      // emptyArrays: false, // Don't Remove empty arrays, ie: []
      // emptyObjects: false, // Don't Remove empty objects, ie: {}
      // emptyStrings: false, // Don't Remove empty strings, ie: ''
      // NaNValues: true, // Remove NaN values, ie: NaN
      // nullValues: true, // Remove null values, ie: null
      undefinedValues: true, // Remove undefined values, ie: undefined
    });
  };

  const getDynamicPreparedValues = (): Promise<object> => {
    const { preparedValues } = state.formSettings ?? {};

    return Promise.resolve(preparedValues ? executeExpression(preparedValues) : {});
  };

  const { getPayload: getDelayedUpdate } = useDelayedUpdate(false) ?? {};

  const prepareDataForSubmit = (): Promise<object> => {
    const initialValuesFromFormSettings = getInitialValuesFromFormSettings();
    const { formData } = state;

    return getDynamicPreparedValues()
      .then((dynamicValues) => {
        const initialValues = getInitialValuesFromFormSettings();
        const nonFormValues = { ...dynamicValues, ...initialValues };
        const { excludeFormFieldsInPayload } = state.formSettings ?? {};

        let postData = excludeFormFieldsInPayload
          ? removeGhostKeys({ ...formData, ...nonFormValues })
          : removeGhostKeys(addFormFieldsList(formData, nonFormValues, form));

        postData = filterDataByOutputComponents(postData, allComponents, toolboxComponents);

        const delayedUpdate = typeof getDelayedUpdate === 'function' ? getDelayedUpdate() : null;
        if (Boolean(delayedUpdate)) postData._delayedUpdate = delayedUpdate;

        const subFormNamesToIgnore = getComponentNames(
          allComponents,
          (component: IDataSourceComponent) =>
            (component?.type === 'list' || component?.type === 'subForm') && component.dataSource === 'api'
        );

        if (subFormNamesToIgnore?.length) {
          subFormNamesToIgnore.forEach((key) => {
            if (Object.hasOwn(postData, key)) {
              delete postData[key];
            }
          });
          const isEqualOrStartsWith = (input: string) =>
            subFormNamesToIgnore?.some((x) => x === input || input.startsWith(`${x}.`));

          postData._formFields = postData._formFields?.filter((x) => !isEqualOrStartsWith(x));
        }

        if (excludeFormFieldsInPayload) {
          delete postData._formFields;
        } else {
          if (initialValuesFromFormSettings) {
            postData._formFields = Array.from(
              new Set<string>([...(postData._formFields || []), ...Object.keys(initialValuesFromFormSettings)])
            );
          }
        }

        return postData;
      })
      .catch((error) => console.error(error));
  };

  configurableFormActions = {
    ...getFlagSetters(dispatch),
    getComponentModel,
    isComponentReadOnly,
    isComponentHidden,
    getChildComponents,
    getChildComponentIds,
    setFormMode,
    setVisibleComponents,
    updateStateFormData,
    setFormControlsData,
    setValidationErrors,
    registerActions,
    getAction,
    getSection,
    getToolboxComponent,
    setFormData,
    hasVisibleChilds,
    isComponentFiltered,
    prepareDataForSubmit,
    executeExpression,
  };

  if (formRef) formRef.current = { ...configurableFormActions, ...state, allComponents, componentRelations };


  useDeepCompareEffect(() => {
    // set main form if empty
    if (needDebug)
      formProviderContext.contextManager?.updatePageFormInstance({ ...state, ...configurableFormActions } as ConfigurableFormInstance);
  }, [state]);

  return (
    <FormStateContext.Provider value={{ ...state, allComponents, componentRelations }}>
      <FormActionsContext.Provider value={configurableFormActions}>
        {children}
      </FormActionsContext.Provider>
    </FormStateContext.Provider>
  );
};

const FormProvider: FC<PropsWithChildren<IFormProviderProps>> = (props) => {
  return (
    <DelayedUpdateProvider>
      <FormProviderInternal {...props}>
        {props.children}
      </FormProviderInternal>
    </DelayedUpdateProvider>
  );
};

function useFormState(require: boolean = true) {
  const context = useContext(FormStateContext);

  if (require && context === undefined) {
    throw new Error('useFormState must be used within a FormProvider');
  }

  return context;
}

function useFormActions(require: boolean = true) {
  const context = useContext(FormActionsContext);

  if (require && context === undefined) {
    throw new Error('useFormActions must be used within a FormProvider');
  }

  return context;
}

function useForm(require: boolean = true): ConfigurableFormInstance {
  const actionsContext = useFormActions(require);
  const stateContext = useFormState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

/** Returns component model by component id  */
export const useComponentModel = (id: string): IConfigurableFormComponent => {
  const form = useForm();

  return useMemo(() => {
    const componentModel = form.getComponentModel(id);
    return componentModel;
  }, [id, form]);
};

export { FormProvider, useForm, useFormActions, useFormState };
