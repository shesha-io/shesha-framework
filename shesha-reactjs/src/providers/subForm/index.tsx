import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { App, ColProps } from 'antd';
import {
  componentsFlatStructureToTree,
  componentsTreeToFlatStructure,
  upgradeComponents,
  useApplicationContextData,
} from '@/providers/form/utils';
import { DEFAULT_FORM_SETTINGS, IFormDto } from '../form/models';
import { GetDataError, useActualContextExecution, useDeepCompareMemo } from '@/hooks';
import { ISubFormProviderProps } from './interfaces';
import { StandardEntityActions } from '@/interfaces/metadata';
import { ISubFormActionsContext, ISubFormStateContext, SUB_FORM_CONTEXT_INITIAL_STATE, SubFormActionsContext, SubFormContext } from './contexts';
import { subFormReducer } from './reducer';
import { ConditionalMetadataProvider, IConfigurableFormComponent, isConfigurableFormComponent, useDataContextManagerActionsOrUndefined, useHttpClient } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useForm } from '@/providers/form';
import { UseFormConfigurationArgs } from '../form/api';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useGlobalState } from '@/providers/globalState';
import { useModelApiHelper } from '@/components/configurableForm/useActionEndpoint';
import {
  IPersistedFormPropsWithComponents,
  fetchDataErrorAction,
  fetchDataRequestAction,
  fetchDataSuccessAction,
  setMarkupWithSettingsAction,
} from './actions';
import ParentProvider, { useParentOrUndefined } from '../parentProvider/index';
import { IFormApi } from '../form/formApi';
import { ISetFormDataPayload } from '../form/contexts';
import { deepMergeValues, setValueByPropertyName } from '@/utils/object';
import { AxiosResponse } from 'axios';
import { ConfigurableItemIdentifierToString } from '@/interfaces/configurableItems';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { extractAjaxResponse, IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { getEntityTypeIdentifierQueryParams, getEntityTypeName } from '../metadataDispatcher/entities/utils';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { IEntity, IGenericGetPayload } from '@/interfaces/gql';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { buildUrl } from '@/utils';
import { getClassNameOrUndefined, getIdOrUndefined } from '@/utils/entity';
import { IGlobalState } from '../globalState/contexts';
import { MessageInstance } from 'antd/es/message/interface';

interface IFormLoadingState {
  isLoading: boolean;
  error: unknown;
}

const EMPTY_OBJECT = {};

type OnCreatedFunction = (
  value: ISubFormProviderProps['value'],
  globalState: IGlobalState['globalState'],
  responseData: IEntity,
  message: MessageInstance,
  application: ReturnType<typeof useApplicationContextData>) => void;
type OnUpdated = (
  value: ISubFormProviderProps['value'],
  globalState: IGlobalState['globalState'],
  responseData: IEntity,
  message: MessageInstance,
) => void;

const SubFormProvider: FC<PropsWithChildren<ISubFormProviderProps>> = (props) => {
  const {
    formSelectionMode,
    formType,
    children,
    value,
    formId,
    onCreated,
    onUpdated,
    id,
    componentName,
    dataSource,
    markup,
    properties,
    propertyName,
    labelCol,
    wrapperCol,
    queryParams,
    onChange,
    defaultValue,
    entityType,
    context,
  } = props;

  const parent = useParentOrUndefined();
  const httpClient = useHttpClient();

  const ctxManager = useDataContextManagerActionsOrUndefined();
  const contextId = context ? (ctxManager?.getDataContext(context)?.uid ?? context) : undefined;

  const [state, dispatch] = useReducer(subFormReducer, SUB_FORM_CONTEXT_INITIAL_STATE);
  const { message, notification } = App.useApp();

  const form = useForm();
  const { globalState } = useGlobalState();
  const appContextData = useApplicationContextData();
  const [formConfig, setFormConfig] = useState<UseFormConfigurationArgs>({ formId, lazy: true });

  const designerComponents = useFormDesignerComponents();

  const actualQueryParams = useActualContextExecution(queryParams, undefined, EMPTY_OBJECT);
  const actualGetUrl = useActualContextExecution(props.getUrl, undefined, "");
  const actualPostUrl = useActualContextExecution(props.postUrl, undefined, "");
  const actualPutUrl = useActualContextExecution<string>(props.putUrl, undefined, "");

  var parentFormApi = parent?.formApi ?? form.shaForm.getPublicFormApi();

  const onChangeInternal = (newValue: object): void => {
    if (onChange)
      onChange(newValue);
    else
      // onChange is empty only if propertyName is not set and need to set value directly to the form data
      parentFormApi.setFieldsValue(newValue);
  };

  const onClearInternal = (): void => {
    if (onChange)
      onChange({});
    else
      parentFormApi.clearFieldsValue();
  };

  const classNameFromValue = getClassNameOrUndefined(value);
  const internalEntityType = props.apiMode === 'entityName' ? entityType : classNameFromValue;
  const prevRenderedEntityTypeForm = useRef<string | IEntityTypeIdentifier | null>(null);

  const urlHelper = useModelApiHelper();
  const getReadUrl = (): Promise<string> => {
    if (dataSource !== 'api') return Promise.reject('`getUrl` is available only when `dataSource` = `api`');

    return !isNullOrWhiteSpace(actualGetUrl)
      ? Promise.resolve(actualGetUrl) // if getUrl is specified - evaluate value using JS
      : internalEntityType
        ? urlHelper // if entityType is specified - get default url for the entity
          .getDefaultActionUrl({ modelType: internalEntityType, actionName: StandardEntityActions.read })
          .then((endpoint) => endpoint.url)
        : Promise.resolve(''); // return empty string
  };

  const [formLoadingState, setFormLoadingState] = useState<IFormLoadingState>({ isLoading: false, error: null });

  const { getFormAsync: getForm } = useConfigurationItemsLoader();

  const { getEntityFormIdAsync } = useConfigurationItemsLoader();

  const entityTypeFormCache = useRef<Record<string, IFormDto>>({});

  useEffect(() => {
    if (formConfig.formId !== formId)
      setFormConfig({ formId, lazy: true });
  }, [formId, formConfig.formId]);

  const setMarkup = useCallback((payload: IPersistedFormPropsWithComponents): void => {
    const flatStructure = componentsTreeToFlatStructure(designerComponents, payload.components);
    upgradeComponents(designerComponents, payload.formSettings, flatStructure);
    const tree = componentsFlatStructureToTree(designerComponents, flatStructure);

    dispatch(
      setMarkupWithSettingsAction({
        ...payload,
        components: tree,
        ...flatStructure,
      }),
    );
  }, [designerComponents]);

  // show form based on the entity type
  useEffect(() => {
    if (formSelectionMode === 'dynamic') {
      if (internalEntityType) {
        if (internalEntityType !== prevRenderedEntityTypeForm.current) {
          const entityTypeName = getEntityTypeName(internalEntityType) ?? "";
          const cachedFormDto = entityTypeFormCache.current[entityTypeName];
          if (cachedFormDto) {
            setMarkup({
              hasFetchedConfig: true,
              id: cachedFormDto.id,
              module: cachedFormDto.module,
              name: cachedFormDto.name,
              components: cachedFormDto.markup ?? [],
              formSettings: cachedFormDto.settings ?? DEFAULT_FORM_SETTINGS,
              description: cachedFormDto.description ?? undefined,
            });
            prevRenderedEntityTypeForm.current = internalEntityType;
          } else {
            if (isNullOrWhiteSpace(formType))
              throw new Error("'formType' is required when 'formSelectionMode' = 'dynamic'");
            getEntityFormIdAsync(internalEntityType, formType)
              .then((formid) => {
                setFormConfig({ formId: { name: formid.name, module: formid.module }, lazy: true });
                prevRenderedEntityTypeForm.current = internalEntityType;
              })
              .catch((error) => {
                console.error('Failed to get form id', error);
              });
          }
        }
      } else {
        setMarkup({
          hasFetchedConfig: false,
          id: undefined,
          module: undefined,
          name: undefined,
          components: [],
          formSettings: DEFAULT_FORM_SETTINGS,
          description: undefined,
        });
        prevRenderedEntityTypeForm.current = null;
      }
    }
  }, [formSelectionMode, formType, getEntityFormIdAsync, internalEntityType, setMarkup, value]);

  /**
   * Get final query params taking into account all settings
   */
  const getFinalQueryParams = (): IGenericGetPayload | undefined => {
    if (form.formMode === 'designer' || dataSource !== 'api')
      return undefined;

    const localQueryParams = typeof actualQueryParams === 'object'
      ? actualQueryParams
      : {};

    const id = getIdOrUndefined(actualQueryParams) ?? getIdOrUndefined(value) ?? "";

    const params: IGenericGetPayload = {
      ...(internalEntityType ? getEntityTypeIdentifierQueryParams(internalEntityType) : {}),
      properties: Boolean(properties)
        ? ['id', ...Array.from(new Set(Array.isArray(properties) ? properties : [properties]))].join(' ')
        : "",
      ...localQueryParams,
      id: id,
    };

    return params;
  };

  const finalQueryParams = useDeepCompareMemo(() => {
    const result = getFinalQueryParams();
    return result;
  }, [actualQueryParams, properties, internalEntityType]);

  // abort controller, is used to cancel out of date data requests
  const dataRequestAbortController = useRef<AbortController | null>(null);

  const fetchData = (forceFetchData: boolean = false): void => {
    if (dataSource !== 'api') {
      return;
    }

    const id = finalQueryParams?.id;

    // Skip loadng if entity with this Id is already fetched
    if (!forceFetchData && id === state.fetchedEntityId) {
      return;
    }

    // clear sub-form values and skip loading if the Id is empty
    if (isNullOrWhiteSpace(id)) {
      onClearInternal();
      dispatch(fetchDataSuccessAction({ entityId: "" }));
      return;
    }

    if (dataRequestAbortController.current) dataRequestAbortController.current.abort('out of date');

    // Skip loading if we work with entity and the `id` is not specified
    if (internalEntityType && !finalQueryParams?.id) {
      return;
    }

    // NOTE: getUrl may be null and a real URL according to the entity type or other params
    // if (!getUrl) return;

    const abortController = new AbortController();
    dataRequestAbortController.current = abortController;

    dispatch(fetchDataRequestAction());
    getReadUrl().then((getUrl) => {
      if (isNullOrWhiteSpace(getUrl)) {
        dispatch(fetchDataSuccessAction({ entityId: "" }));
        return;
      }

      const url = buildUrl(getUrl, finalQueryParams);
      httpClient.get<IAjaxResponse<IEntity>>(url, { signal: abortController.signal })
        .then((response) => {
          if (abortController.signal.aborted) return;

          dataRequestAbortController.current = null;

          const dataResponse = extractAjaxResponse(response.data);

          const classNameFromValue = getClassNameOrUndefined(value);
          const classNameFromResponse = getClassNameOrUndefined(dataResponse);

          const newValue = classNameFromValue !== undefined && classNameFromResponse === undefined
            ? { ...dataResponse, classNameFromValue }
            : dataResponse;
          onChangeInternal(newValue);
          dispatch(fetchDataSuccessAction({ entityId: newValue.id }));
        })
        .catch((e) => {
          onClearInternal();
          dispatch(fetchDataErrorAction({ error: e as GetDataError<unknown> })); // TODO: handle error type and extract if required
        });
    })
      .catch((e) => {
        onClearInternal();
        dispatch(fetchDataErrorAction({ error: e as GetDataError<unknown> })); // TODO: handle error type and extract if required
      });
  };

  const debouncedFetchData = useDebouncedCallback((forceFetchData: boolean) => {
    fetchData(forceFetchData);
  }, 300);

  // fetch data on first rendering and on change of some properties
  useDeepCompareEffect(() => {
    if (dataSource === 'api') fetchData();
  }, [dataSource, finalQueryParams, internalEntityType]); // TODO: memoize final getUrl and add as a dependency

  const postData = useDebouncedCallback(() => {
    if (isNullOrWhiteSpace(actualPostUrl)) {
      notification.error({
        placement: 'top',
        message: 'postUrl missing',
        description: 'Please make sure you have specified the POST URL',
      });
    } else {
      httpClient.post<IAjaxResponse<IEntity>>(actualPostUrl, value)
        .then((response) => {
          const result = extractAjaxResponse(response.data);
          onChangeInternal(result);
          if (!isNullOrWhiteSpace(onCreated)) {
            const evaluateOnCreated = (): void => {
              const func = new Function('data, globalState, submittedValue, message, application', onCreated) as OnCreatedFunction;
              func(value, globalState, result, message, appContextData);
            };

            evaluateOnCreated();
          }
        })
        .catch((error) => {
          console.error('Failed to create entity', error);
        });
    }
  }, 300);

  const putData = useDebouncedCallback(() => {
    if (!actualPutUrl) {
      notification.error({
        placement: 'top',
        message: 'putUrl missing',
        description: 'Please make sure you have specified the PUT URL',
      });
    } else {
      httpClient.put<IAjaxResponse<IEntity>>(actualPutUrl, value)
        .then((response) => {
          const result = extractAjaxResponse(response.data);
          onChangeInternal(result);
          if (onUpdated) {
            const evaluateOnUpdated = (): void => {
              const func = new Function('data, globalState, response, message', onUpdated) as OnUpdated;
              func(value, globalState, result, message);
            };

            evaluateOnUpdated();
          }
        })
        .catch((error) => {
          console.error('Failed to update entity', error);
        });
    }
  }, 300);
  //#endregion

  //#region Fetch Form
  useDeepCompareEffect(() => {
    if (formConfig.formId && !markup) {
      setFormLoadingState({ isLoading: true, error: null });

      getForm({ formId: formConfig.formId, skipCache: false })
        .then((response) => {
          setFormLoadingState({ isLoading: false, error: null });

          if (internalEntityType && formSelectionMode === 'dynamic') {
            const entityTypeName = getEntityTypeName(internalEntityType) ?? "";
            if (!entityTypeFormCache.current[entityTypeName])
              entityTypeFormCache.current[entityTypeName] = response;
          }

          setMarkup({
            hasFetchedConfig: true,
            id: response.id,
            module: response.module,
            name: response.name,
            components: response.markup ?? [],
            formSettings: response.settings ?? DEFAULT_FORM_SETTINGS,
            description: response.description ?? undefined,
          });
        })
        .catch((e) => {
          setFormLoadingState({ isLoading: false, error: e });
        });
    }

    if (!formConfig.formId && markup) {
      setMarkup({ ...markup, hasFetchedConfig: false });
    }

    if (!formConfig.formId && !markup) {
      setMarkup({ components: [], formSettings: DEFAULT_FORM_SETTINGS, hasFetchedConfig: false });
    }
  }, [formConfig.formId, markup]);
  //#endregion

  const getChildComponents = (componentId: string): IConfigurableFormComponent[] => {
    const childIds = state.componentRelations[componentId];

    if (!childIds) return [];
    const components: IConfigurableFormComponent[] = [];
    childIds.forEach((childId) => {
      if (isConfigurableFormComponent(state.allComponents[childId]))
        components.push(state.allComponents[childId]);
    });
    return components;
  };

  const actionDependencies = [id];
  const actionsOwnerName = componentName ?? `subForm-${id}`;
  useConfigurableAction(
    {
      name: 'Get form data',
      owner: actionsOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        debouncedFetchData(true); // TODO: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Post form data',
      owner: actionsOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        postData(); // TODO: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Update form data',
      owner: actionsOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        putData(); // TODO: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  //#endregion

  const getColSpan = (span: number | ColProps | undefined): ColProps | undefined => {
    if (!span) return undefined;

    return typeof span === 'number' ? { span } : span;
  };

  const getSubFormData = (): object => {
    const data = parentFormApi.getFormData();
    return !isNullOrWhiteSpace(props.propertyName) && isDefined(data)
      ? (data as Record<string, unknown>)[props.propertyName] as object
      : data;
  };

  const subFormApi: IFormApi = {
    addDelayedUpdateData: (data: object) => {
      return parentFormApi.addDelayedUpdateData(data);
    },
    setFieldValue: (name, value) => {
      onChangeInternal(deepMergeValues(getSubFormData(), setValueByPropertyName({}, name, value)));
    },
    setFieldsValue: (values) => {
      onChangeInternal(deepMergeValues(getSubFormData(), values));
    },
    clearFieldsValue: () => {
      onChangeInternal({});
    },
    submit: function (): void {
      parentFormApi.submit();
    },
    setFormData: function (payload: ISetFormDataPayload): void {
      if (payload.mergeValues) {
        onChangeInternal(deepMergeValues(value, payload.values));
      } else {
        onChangeInternal(payload.values);
      }
    },
    getFormData: function (): object {
      return getSubFormData();
    },
    showLoader: function (message?: string) {
      return parentFormApi.showLoader(message);
    },
    hideLoaders: function (): void {
      parentFormApi.hideLoaders();
    },
    setValidationErrors: function (payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error): void {
      parentFormApi.setValidationErrors(payload);
    },
    formSettings: parentFormApi.formSettings,
    formMode: parentFormApi.formMode,
    data: isDefined(parentFormApi.data) && !isNullOrWhiteSpace(props.propertyName)
      ? (parentFormApi.data as Record<string, unknown>)[props.propertyName] as object
      : {},
    defaultApiEndpoints: parentFormApi.defaultApiEndpoints,
  };

  return (
    <SubFormContext.Provider
      value={{
        ...state,
        initialValues: value,
        errors: {
          ...state.errors,
          getForm: formLoadingState.error,
        },
        loading: {
          ...state.loading,
          getForm: formLoadingState.isLoading,
        },
        components: state.components,
        formSettings: {
          ...state.formSettings ?? DEFAULT_FORM_SETTINGS,
          labelCol: getColSpan(labelCol) ?? getColSpan(state.formSettings?.labelCol) ?? DEFAULT_FORM_SETTINGS.labelCol,
          wrapperCol: getColSpan(wrapperCol) ?? getColSpan(state.formSettings?.wrapperCol) ?? DEFAULT_FORM_SETTINGS.wrapperCol, // Override with the incoming one
        },
        propertyName,
        value: value || defaultValue,
        context: contextId,
      }}
    >
      <SubFormActionsContext.Provider
        value={{
          getData: () => debouncedFetchData(false),
          postData,
          putData,
          getChildComponents,
        }}
      >
        <ConditionalMetadataProvider modelType={state.formSettings?.modelType}>
          <ParentProvider
            model={props}
            context={contextId}
            isScope
            name={`SubForm ${componentName || (formId ? ConfigurableItemIdentifierToString(formId) : "")}`}
            formApi={subFormApi}
            formFlatMarkup={{ allComponents: state.allComponents, componentRelations: state.componentRelations }}
          >
            {children}
          </ParentProvider>
        </ConditionalMetadataProvider>
      </SubFormActionsContext.Provider>
    </SubFormContext.Provider>
  );
};

function useSubFormState(require: boolean): ISubFormStateContext | undefined {
  const context = useContext(SubFormContext);

  if (context === undefined && require) {
    throw new Error('useSubFormState must be used within a SubFormProvider');
  }

  return context;
}

function useSubFormActions(require: boolean): ISubFormActionsContext | undefined {
  const context = useContext(SubFormActionsContext);

  if (context === undefined && require) {
    throw new Error('useSubFormActions must be used within a SubFormProvider');
  }

  return context;
}

function useSubForm(require: boolean = true): ISubFormStateContext & ISubFormActionsContext | undefined {
  const actionsContext = useSubFormActions(require);
  const stateContext = useSubFormState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export { SubFormProvider, useSubForm, useSubFormActions, useSubFormState };
