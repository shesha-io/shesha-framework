import { FormInstance } from 'antd';
import React, { useCallback, FC, MutableRefObject, PropsWithChildren, useContext, useEffect, useRef, useMemo } from 'react';
import useThunkReducer from '@/hooks/thunkReducer';
import {
  IConfigurableFormComponent,
  IFormValidationErrors,
  IDictionary,
} from '@/interfaces';
import { DelayedUpdateProvider, useDelayedUpdate } from '@/providers/delayedUpdateProvider';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import {
  registerComponentActionsAction,
  setFormDataAction,
  setFormModeAction,
  setValidationErrorsAction,
} from './actions';
import {
  ConfigurableFormInstance,
  FORM_CONTEXT_INITIAL_STATE,
  FormActionsContext,
  FormStateContext,
  IFormActionsContext,
  IFormStateContext,
  IFormStateInternalContext,
  ISetFormDataPayload,
} from './contexts';
import { useFormDesignerComponents } from './hooks';
import { FormMode, IFormActions, IFormSections, IFormSettings, ISubmitActionArguments, Store } from './models';
import formReducer from './reducer';
import { convertActions, convertSectionsToList, evaluateKeyValuesToObjectMatchedData, executeScript, getComponentNames, getFilteredComponentIds, getSheshaFormUtils, useFormProviderContext } from './utils';
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
import { FormFlatMarkupProvider, useChildComponentIds, useChildComponents, useComponentModel, useFormMarkup } from './providers/formMarkupProvider';
import { useFormDesignerActions } from '../formDesigner';

type ShaFormCompoundedComponent = {
  useMarkup: typeof useFormMarkup;
  useComponentModel: typeof useComponentModel;
  useChildComponents: typeof useChildComponents;
  useChildComponentIds: typeof useChildComponentIds;
  MarkupProvider: typeof FormFlatMarkupProvider;
};
const ShaForm: ShaFormCompoundedComponent = {
  useMarkup: useFormMarkup,
  useComponentModel: useComponentModel,
  useChildComponents: useChildComponents,
  useChildComponentIds: useChildComponentIds,
  MarkupProvider: FormFlatMarkupProvider,
};

export interface IFormProviderProps {
  needDebug?: boolean;
  name: string;
  formSettings: IFormSettings;
  mode: FormMode;
  form?: FormInstance<any>;
  actions?: IFormActions;
  sections?: IFormSections;
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
  mode = 'readonly',
  form,
  actions,
  sections,
  formRef,
  formSettings,
  refetchData,
  isActionsOwner,
  propertyFilter,
  needDebug,
  ...props
}) => {
  const getInitialData = (): IFormStateInternalContext => {
    //const formData = form?.getFieldValue([]);
    const formData = props.initialValues;

    return {
      ...FORM_CONTEXT_INITIAL_STATE,
      name: name,
      formMode: mode,
      form,
      formData: formData,
      actions: convertActions(null, actions),
      sections: convertSectionsToList(null, sections),
      formSettings: formSettings,
    };
  };
  const [state, dispatch] = useThunkReducer(formReducer, undefined, getInitialData);
  const { allComponents } = ShaForm.useMarkup();

  const toolboxComponents = useFormDesignerComponents();

  const formProviderContext = useFormProviderContext();

  const filteredComponents = useRef<string[]>();

  filteredComponents.current = useDeepCompareMemo(() => {
    return getFilteredComponentIds(
      allComponents,
      propertyFilter
    );
  }, [allComponents, propertyFilter]);

  const isComponentFiltered = useCallback((component: IConfigurableFormComponent): boolean => {
    return filteredComponents.current?.includes(component.id);
  }, [filteredComponents.current]);

  const getToolboxComponent = useCallback((type: string) => toolboxComponents[type], [toolboxComponents]);

  //#region data fetcher

  const fetchData = (): Promise<any> => {
    return refetchData ? refetchData() : Promise.reject('fetcher not specified');
  };

  //#endregion

  const setFormMode = useCallback((formMode: FormMode) => {
    dispatch(setFormModeAction(formMode));
  }, [dispatch]);

  useEffect(() => {
    if (mode !== state.formMode) {
      setFormMode(mode);
    }
  }, [mode]);

  const setValidationErrors = useCallback((payload: IFormValidationErrors) => {
    dispatch(setValidationErrorsAction(payload));
  }, [dispatch]);

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
        if (hasPreviousActionError(actionContext)) {
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

  const { onValuesChange } = props;
  const updateStateFormData = useCallback((payload: ISetFormDataPayload) => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(setFormDataAction(payload));
      const newState = getState();

      if (typeof onValuesChange === 'function')
        onValuesChange(payload.values, newState.formData);
    });
  }, [dispatch, onValuesChange]);

  const setFormData = useCallback((payload: ISetFormDataPayload) => {
    updateStateFormData(payload);

    if (payload?.mergeValues) {
      form?.setFieldsValue(payload?.values);
    } else {
      form?.resetFields();
      form?.setFieldsValue(payload?.values);
    }
  }, [form, updateStateFormData]);

  //#region form actions
  const registerActions = useCallback((ownerId: string, actionsToRegister: IFormActions) => {
    dispatch(registerComponentActionsAction({ id: ownerId, actions: actionsToRegister }));
  }, [dispatch]);

  const getAction = useCallback((componentId: string, name: string) => {
    // search requested action in all parents and fallback to form
    let currentId = componentId;
    do {
      const component = allComponents[currentId];

      const action = state.actions.find((a) => a.owner === (component?.parentId ?? null) && a.name === name);
      if (action) return (data, parameters) => action.body(data, parameters);

      currentId = component?.parentId;
    } while (currentId);

    return null;
  }, [allComponents, state.actions]);
  //#endregion

  const getSection = useCallback((componentId: string, name: string) => {
    // search requested section in all parents and fallback to form
    let currentId = componentId;

    do {
      const component = allComponents[currentId];

      const section = state.sections.find((a) => a.owner === (component?.parentId ?? null) && a.name === name);
      if (section) return (data) => section.body(data);

      currentId = component?.parentId;
    } while (currentId);

    return null;
  }, [allComponents, state.sections]);

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
      form: getFormApi({
        form: state.form,
        formSettings: state.formSettings,
        formMode: state.formMode,
        formData: state.formData,
        setFormData: setFormData,
      }),
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
    const { preparedValues } = formSettings ?? {};

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
        const { excludeFormFieldsInPayload } = formSettings ?? {};

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

  const configurableFormActions = useMemo<IFormActionsContext>(() => (
    {
      setFormMode,
      updateStateFormData,
      setValidationErrors,
      registerActions,
      setFormData,
      isComponentFiltered,

      getAction,
      getSection,
      getToolboxComponent,

      prepareDataForSubmit,
      executeExpression,
    }), [
    setFormMode,
    updateStateFormData,
    setValidationErrors,
    registerActions,
    setFormData,
    isComponentFiltered,
    getAction,
    getSection,
    getToolboxComponent]);

  if (formRef)
    formRef.current = { ...configurableFormActions, ...state };

  useDeepCompareEffect(() => {
    // set main form if empty
    if (needDebug)
      formProviderContext.contextManager?.updatePageFormInstance({ ...state, ...configurableFormActions } as ConfigurableFormInstance);
  }, [state]);

  return (
    <FormStateContext.Provider value={{ ...state, formSettings }}>
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

const useFormState = (require: boolean = true): IFormStateContext => {
  const context = useContext(FormStateContext);

  if (require && context === undefined) {
    throw new Error('useFormState must be used within a FormProvider');
  }

  return context;
};

const useFormActions = (require: boolean = true): IFormActionsContext => {
  const context = useContext(FormActionsContext);

  if (require && context === undefined) {
    throw new Error('useFormActions must be used within a FormProvider');
  }

  return context;
};

const useForm = (require: boolean = true): ConfigurableFormInstance => {
  const actionsContext = useFormActions(require);
  const stateContext = useFormState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useIsDrawingForm = (): boolean => {
  const { formMode } = useForm();
  const designer = useFormDesignerActions(false);

  const isDrawing = useMemo(() => {
    return formMode === 'designer' && Boolean(designer);
  }, [formMode, designer]);
  return isDrawing;
};

export {
  ShaForm,
  FormProvider,
  useForm,
  useFormActions,
  useFormState,
  useIsDrawingForm,
};