import * as RestfulShesha from '@/utils/fetchers';
import React, {
  FC,
  PropsWithChildren,
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
import { EntitiesGetQueryParams } from '@/apis/entities';
import { EntityAjaxResponse } from '@/generic-pages/dynamic/interfaces';
import { GetDataError, useActualContextExecution, useDeepCompareMemo, useMutate } from '@/hooks';
import { ISubFormProviderProps } from './interfaces';
import { StandardEntityActions } from '@/interfaces/metadata';
import { ISubFormActionsContext, ISubFormStateContext, SUB_FORM_CONTEXT_INITIAL_STATE, SubFormActionsContext, SubFormContext } from './contexts';
import { subFormReducer } from './reducer';
import { IConfigurableFormComponent, MetadataProvider, useDataContextManagerActionsOrUndefined, useSheshaApplication } from '@/providers';
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
import ParentProvider, { useParent } from '../parentProvider/index';
import ConditionalWrap from '@/components/conditionalWrapper';
import { IFormApi } from '../form/formApi';
import { ISetFormDataPayload } from '../form/contexts';
import { deepMergeValues, setValueByPropertyName } from '@/utils/object';
import { AxiosResponse } from 'axios';
import { ConfigurableItemIdentifierToString } from '@/interfaces/configurableItems';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { extractAjaxResponse, IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';

interface IFormLoadingState {
  isLoading: boolean;
  error: any;
}

const EMPTY_OBJECT = {};

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

  const parent = useParent(false);

  const ctxManager = useDataContextManagerActionsOrUndefined();
  const contextId = context ? (ctxManager?.getDataContext(context)?.uid ?? context) : undefined;

  const [state, dispatch] = useReducer(subFormReducer, SUB_FORM_CONTEXT_INITIAL_STATE);
  const { message, notification } = App.useApp();

  const form = useForm();
  const { globalState } = useGlobalState();
  const appContextData = useApplicationContextData();
  const [formConfig, setFormConfig] = useState<UseFormConfigurationArgs>({ formId, lazy: true });

  const { backendUrl, httpHeaders } = useSheshaApplication();
  const designerComponents = useFormDesignerComponents();

  const actualQueryParams = useActualContextExecution(props.queryParams, undefined, EMPTY_OBJECT);
  const actualGetUrl = useActualContextExecution(props.getUrl, undefined, "");
  const actualPostUrl = useActualContextExecution(props.postUrl, undefined, "");
  const actualPutUrl = useActualContextExecution<string>(props.putUrl, undefined, "");

  var parentFormApi = parent?.formApi ?? form.shaForm.getPublicFormApi();

  const onChangeInternal = (newValue: any): void => {
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

  const internalEntityType = (props.apiMode === 'entityName' ? entityType : value?.['_className']) || value?.['_className'];
  const prevRenderedEntityTypeForm = useRef<string>(null);

  const urlHelper = useModelApiHelper();
  const getReadUrl = (): Promise<string> => {
    if (dataSource !== 'api') return Promise.reject('`getUrl` is available only when `dataSource` = `api`');

    return actualGetUrl
      ? Promise.resolve(actualGetUrl) // if getUrl is specified - evaluate value using JS
      : internalEntityType
        ? urlHelper // if entityType is specified - get default url for the entity
          .getDefaultActionUrl({ modelType: internalEntityType, actionName: StandardEntityActions.read })
          .then((endpoint) => endpoint.url)
        : Promise.resolve(''); // return empty string
  };

  const [formLoadingState, setFormLoadingState] = useState<IFormLoadingState>({ isLoading: false, error: null });

  const { getForm } = useConfigurationItemsLoader();

  const { getEntityFormId } = useConfigurationItemsLoader();

  const entityTypeFormCache = useRef<{ [key: string]: IFormDto }>({});

  useEffect(() => {
    if (formConfig?.formId !== formId) setFormConfig({ formId, lazy: true });
  }, [formId]);

  const setMarkup = (payload: IPersistedFormPropsWithComponents): void => {
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
  };

  // show form based on the entity type
  useEffect(() => {
    if (formSelectionMode === 'dynamic') {
      if (internalEntityType) {
        if (internalEntityType !== prevRenderedEntityTypeForm.current) {
          const cachedFormDto = entityTypeFormCache.current[internalEntityType];
          if (cachedFormDto) {
            setMarkup({
              hasFetchedConfig: true,
              id: cachedFormDto.id,
              module: cachedFormDto.module,
              name: cachedFormDto.name,
              components: cachedFormDto.markup,
              formSettings: cachedFormDto.settings,
              description: cachedFormDto.description,
            });
            prevRenderedEntityTypeForm.current = internalEntityType;
          } else {
            getEntityFormId(internalEntityType, formType).then((formid) => {
              setFormConfig({ formId: { name: formid.name, module: formid.module }, lazy: true });
              prevRenderedEntityTypeForm.current = internalEntityType;
            });
          }
        }
        if (!internalEntityType && state.formSettings?.modelType)
          onChangeInternal(deepMergeValues(value, { _className: state.formSettings?.modelType }));
      } else {
        setMarkup({
          hasFetchedConfig: false,
          id: null,
          module: null,
          name: null,
          components: [],
          formSettings: null,
          description: null,
        });
        prevRenderedEntityTypeForm.current = null;
      }
    }
  }, [value]);

  const { mutate: postHttpInternal, loading: isPosting, error: postError } = useMutate<unknown, IAjaxResponse<unknown>>();
  const postHttp = (data): Promise<IAjaxResponse<unknown>> => {
    return postHttpInternal({ url: actualPostUrl, httpVerb: 'POST' }, data);
  };

  const { mutate: putHttpInternal, loading: isUpdating, error: updateError } = useMutate<unknown, IAjaxResponse<unknown>>();
  const putHttp = (data): Promise<IAjaxResponse<unknown>> => {
    return putHttpInternal({ url: actualPutUrl, httpVerb: 'PUT' }, data);
  };

  /**
   * Get final query params taking into account all settings
   */
  const getFinalQueryParams = (): EntitiesGetQueryParams => {
    if (form.formMode === 'designer' || dataSource !== 'api') return {};

    let params: EntitiesGetQueryParams = { entityType: internalEntityType };

    if (properties) {
      // Always include the `id` property/. Useful for deleting
      params.properties = ['id', ...Array.from(new Set(Array.isArray(properties) ? properties : [properties]))].join(' ');
    }

    if (queryParams) {
      params = { ...params, ...(typeof actualQueryParams === 'object' ? actualQueryParams : {}) };
    }

    if (!params.id && Boolean(value) && value['id'] != null && value['id'] !== undefined)
      params.id = value['id'];

    return params;
  };

  const finalQueryParams = useDeepCompareMemo(() => {
    const result = getFinalQueryParams();
    return result;
  }, [actualQueryParams, properties, internalEntityType]);

  // abort controller, is used to cancel out of date data requests
  const dataRequestAbortController = useRef<AbortController>(null);

  const fetchData = (forceFetchData: boolean = false): void => {
    if (dataSource !== 'api') {
      return;
    }

    // Skip loadng if entity with this Id is already fetched
    if (!forceFetchData && finalQueryParams?.id === state.fetchedEntityId) {
      return;
    }

    // clear sub-form values and skip loading if the Id is empty
    if (!finalQueryParams?.id?.trim() || finalQueryParams?.id.trim() === 'undefined') {
      onClearInternal();
      dispatch(fetchDataSuccessAction({ entityId: finalQueryParams?.id }));
      return;
    }

    if (dataRequestAbortController.current) dataRequestAbortController.current.abort('out of date');

    // Skip loading if we work with entity and the `id` is not specified
    if (internalEntityType && !finalQueryParams?.id) {
      return;
    }

    // NOTE: getUrl may be null and a real URL according to the entity type or other params
    // if (!getUrl) return;

    dataRequestAbortController.current = new AbortController();

    dispatch(fetchDataRequestAction());
    getReadUrl().then((getUrl) => {
      if (!Boolean(getUrl)) {
        dispatch(fetchDataSuccessAction({ entityId: undefined }));
        return;
      }

      RestfulShesha.get<EntityAjaxResponse, any, any, any>(
        getUrl,
        finalQueryParams,
        { base: backendUrl, headers: httpHeaders },
        dataRequestAbortController.current.signal,
      )
        .then((dataResponse) => {
          if (dataRequestAbortController.current?.signal?.aborted) return;

          dataRequestAbortController.current = null;

          if (dataResponse.success) {
            const newValue = value?.['_className'] !== undefined && dataResponse.result['_className'] === undefined
              ? { ...dataResponse.result, _className: value?.['_className'] }
              : dataResponse.result;
            onChangeInternal(newValue);
            dispatch(fetchDataSuccessAction({ entityId: newValue?.id }));
          } else {
            onClearInternal();
            dispatch(fetchDataErrorAction({ error: dataResponse.error as GetDataError<unknown> }));
          }
        })
        .catch((e) => {
          dispatch(fetchDataErrorAction({ error: e }));
        });
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
    if (!actualPostUrl) {
      notification.error({
        placement: 'top',
        message: 'postUrl missing',
        description: 'Please make sure you have specified the POST URL',
      });
    } else {
      postHttp(value).then((submittedValue) => {
        const result = extractAjaxResponse(submittedValue);
        onChangeInternal(result);
        if (onCreated) {
          const evaluateOnCreated = (): void => {
            // tslint:disable-next-line:function-constructor
            return new Function('data, globalState, submittedValue, message, application', onCreated)(
              value,
              globalState,
              result,
              message,
              appContextData,
            );
          };

          evaluateOnCreated();
        }
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
      putHttp(value).then((submittedValue) => {
        const result = extractAjaxResponse(submittedValue);
        onChangeInternal(result);
        if (onUpdated) {
          const evaluateOnUpdated = (): void => {
            // tslint:disable-next-line:function-constructor
            return new Function('data, globalState, response, message', onUpdated)(
              value,
              globalState,
              result,
              message,
            );
          };

          evaluateOnUpdated();
        }
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

          if (internalEntityType && formSelectionMode === 'dynamic' && !entityTypeFormCache.current[internalEntityType])
            entityTypeFormCache.current[internalEntityType] = response;

          setMarkup({
            hasFetchedConfig: true,
            id: response.id,
            module: response.module,
            name: response.name,
            components: response.markup,
            formSettings: response.settings,
            description: response.description,
          });
        })
        .catch((e) => {
          setFormLoadingState({ isLoading: false, error: e });
        });
    }

    if (!formConfig.formId && markup) {
      setMarkup(markup);
    }

    if (!formConfig.formId && !markup) {
      setMarkup({ components: [], formSettings: DEFAULT_FORM_SETTINGS });
    }
  }, [formConfig.formId, markup]);
  //#endregion

  const getChildComponents = (componentId: string): IConfigurableFormComponent[] => {
    const childIds = state.componentRelations[componentId];

    if (!childIds) return [];
    const components = childIds.map((childId) => {
      return state.allComponents[childId];
    });
    return components;
  };

  const actionDependencies = [id];
  useConfigurableAction(
    {
      name: 'Get form data',
      owner: componentName,
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
      owner: componentName,
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
      owner: componentName,
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

  const getColSpan = (span: number | ColProps): ColProps => {
    if (!span) return null;

    return typeof span === 'number' ? { span } : span;
  };

  const getSubFormData: any = () => {
    const data = parentFormApi.getFormData();
    return props.propertyName && data ? data[props.propertyName] : data;
  };

  const subFormApi: IFormApi<any> = {
    addDelayedUpdateData: (data: any) => {
      return parentFormApi.addDelayedUpdateData(data);
    },
    setFieldValue: (name, value) => {
      onChangeInternal(deepMergeValues(getSubFormData(), setValueByPropertyName({}, name?.toString(), value)));
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
    getFormData: function (): any {
      return getSubFormData();
    },
    setValidationErrors: function (payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error): void {
      parentFormApi.setValidationErrors(payload);
    },
    formSettings: parentFormApi.formSettings,
    formMode: parentFormApi.formMode,
    data: parentFormApi.data ? parentFormApi.data[props.propertyName] : undefined,
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
          // TODO: review error types
          postData: postError as GetDataError<unknown>,
          putData: updateError as GetDataError<unknown>,
        },
        loading: {
          ...state.loading,
          getForm: formLoadingState.isLoading,
          postData: isPosting,
          putData: isUpdating,
        },
        components: state?.components,
        formSettings: {
          ...state?.formSettings,
          labelCol: getColSpan(labelCol) || getColSpan(state?.formSettings?.labelCol),
          wrapperCol: getColSpan(wrapperCol) || getColSpan(state?.formSettings?.wrapperCol), // Override with the incoming one
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
        <ConditionalWrap
          condition={Boolean(state.formSettings?.modelType)}
          wrap={(children) => <MetadataProvider modelType={state.formSettings.modelType}>{children}</MetadataProvider>}
        >
          <ParentProvider
            model={props}
            context={contextId}
            isScope
            name={`SubForm ${componentName || ConfigurableItemIdentifierToString(formId)}`}
            formApi={subFormApi}
            formFlatMarkup={{ allComponents: state.allComponents, componentRelations: state.componentRelations }}
          >
            {children}
          </ParentProvider>
        </ConditionalWrap>
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
