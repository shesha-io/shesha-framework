import * as RestfulShesha from '@/utils/fetchers';
import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
  } from 'react';
import { ColProps, message, notification } from 'antd';
import {
  componentsFlatStructureToTree,
  componentsTreeToFlatStructure,
  executeScript,
  upgradeComponents,
  useApplicationContextData
  } from '@/providers/form/utils';
import { DEFAULT_FORM_SETTINGS } from '../form/models';
import { EntitiesGetQueryParams } from '@/apis/entities';
import { EntityAjaxResponse } from '@/generic-pages/dynamic/interfaces';
import {
  GetDataError,
  useDeepCompareMemoKeepReference,
  useMutate,
  usePubSub
  } from '@/hooks';
import { getQueryParams, QueryStringParams } from '@/utils/url';
import { IAnyObject } from '@/interfaces';
import { ISubFormProviderProps } from './interfaces';
import { StandardEntityActions } from '@/interfaces/metadata';
import { SUB_FORM_CONTEXT_INITIAL_STATE, SubFormActionsContext, SubFormContext } from './contexts';
import { subFormReducer } from './reducer';
import { useAppConfigurator, useSheshaApplication } from '@/providers';
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
import ParentProvider from '../parentProvider/index';

interface IFormLoadingState {
  isLoading: boolean;
  error: any;
}

interface QueryParamsEvaluatorArguments {
  data: any;
  query: QueryStringParams;
  globalState: IAnyObject;
}
type QueryParamsEvaluator = (args: QueryParamsEvaluatorArguments) => object;

const SubFormProvider: FC<PropsWithChildren<ISubFormProviderProps>> = (props) => {
  const {
    formSelectionMode,
    formType,
    children,
    value,
    formId,
    getUrl,
    postUrl,
    putUrl,
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

  const [state, dispatch] = useReducer(subFormReducer, SUB_FORM_CONTEXT_INITIAL_STATE);

  const { publish } = usePubSub();
  const { formData = {}, formMode } = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const appContextData = useApplicationContextData();
  const [formConfig, setFormConfig] = useState<UseFormConfigurationArgs>({ formId, lazy: true });
  
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const onChangeInternal = (newValue: any) => {
    if (onChange) 
      onChange({...(typeof value === 'object' ? value : {} ), ...newValue });
  };

  /**
   * Evaluate url using js expression
   *
   * @urlExpression - javascript expression that returns an url
   */
  const evaluateUrlFromJsExpression = (urlExpression: string): string => {
    if (!urlExpression) return '';
    return (() => {
      // tslint:disable-next-line:function-constructor
      return new Function('data, query, globalState, application', urlExpression)(formData, getQueryParams(), globalState, appContextData); // Pass data, query, globalState
    })();
  };

  const evaluateUrl = (urlExpression: string): Promise<string> => {
    if (!urlExpression) return Promise.resolve('');

    return executeScript<string>(urlExpression, {
      data: formData,
      query: getQueryParams(),
      globalState: globalState,
      application: appContextData,
    });
  };

  // update global state on value change
  useDeepCompareEffect(() => {
    if (propertyName) {
      // Note: don't write undefined if subform value is missing in the globalState. It doesn't make any sense but initiates a re-rendering
      const existsInGlobalState = Boolean(globalState) && globalState.hasOwnProperty(propertyName);

      if (value === undefined && !existsInGlobalState
        || !!state.fetchedEntityId && state.fetchedEntityId === (typeof value === 'object' ? value.id : value)
      ) return;

      setGlobalState({
        key: propertyName,
        data: value,
      });
    }
  }, [value, propertyName]);

  const [internalEntityType, setInternalEntityType] = useState(entityType);

  useEffect(() => {
    if (!Boolean(internalEntityType)) {
      if (Boolean(entityType)) {
        setInternalEntityType(entityType);
      } else if (value && typeof value === 'object' && value['_className']) {
        setInternalEntityType(value['_className']);
      }
    } else {
      if (Boolean(entityType) && internalEntityType !== entityType) {
        setInternalEntityType(entityType);
      } else if (
        value &&
        typeof value === 'object' &&
        value['_className'] &&
        internalEntityType !== value['_className']
      ) {
        setInternalEntityType(value['_className']);
      }
    }
  }, [entityType, value]);

  const urlHelper = useModelApiHelper();
  const getReadUrl = (): Promise<string> => {
    if (dataSource !== 'api') return Promise.reject('`getUrl` is available only when `dataSource` = `api`');

    return getUrl
      ? // if getUrl is specified - evaluate value using JS
        evaluateUrl(getUrl)
      : internalEntityType
      ? // if entityType is specified - get default url for the entity
        urlHelper
          .getDefaultActionUrl({ modelType: internalEntityType, actionName: StandardEntityActions.read })
          .then((endpoint) => endpoint.url)
      : // return empty string
        Promise.resolve('');
  };

  const [formLoadingState, setFormLoadingState] = useState<IFormLoadingState>({ isLoading: false, error: null });

  const { getForm } = useConfigurationItemsLoader();
  const { configurationItemMode } = useAppConfigurator();

  const { getEntityFormId } = useConfigurationItemsLoader();

  useEffect(() => {
    if (formConfig?.formId !== formId) setFormConfig({ formId, lazy: true });
  }, [formId]);

  // show form based on the entity type
  useEffect(() => {
    if (value && formSelectionMode === 'dynamic') {
      if (value && typeof value === 'object' && value['_className'] && !formConfig?.formId)
        getEntityFormId(value['_className'], formType).then((formid) => {
          setFormConfig({ formId: { name: formid.name, module: formid.module }, lazy: true });
        });
    }
  }, [value]);

  const { mutate: postHttpInternal, loading: isPosting, error: postError } = useMutate();
  const postHttp = (data) => {
    return postHttpInternal({ url: evaluateUrlFromJsExpression(postUrl), httpVerb: 'POST' }, data);
  };

  const { mutate: putHttpInternal, loading: isUpdating, error: updateError } = useMutate();
  const putHttp = (data) => {
    return putHttpInternal({ url: evaluateUrlFromJsExpression(putUrl), httpVerb: 'PUT' }, data);
  };

  /**
   * Memoized query params evaluator. It executes `queryParams` (javascript defined on the component settings) to get query params
   */
  const queryParamsEvaluator = useMemo<QueryParamsEvaluator>(() => {
    // tslint:disable-next-line:function-constructor
    const func = new Function('data, query, globalState', queryParams);

    return (args) => {
      try {
        const result = func(args?.data, args?.query, args?.globalState);

        // note: delete id if it's undefined/null, missing id should be handled on the top level
        if (result.hasOwnProperty('id') && !Boolean(result.id)) {
          delete result.id;
        }

        return result;
      } catch (error) {
        console.warn('queryParamPayload error: ', error);
        return {};
      }
    };
  }, [queryParams]);

  /**
   * Get final query params taking into account all settings
   */
  const getFinalQueryParams = () => {
    if (formMode === 'designer' || dataSource !== 'api') return {};

    let params: EntitiesGetQueryParams = { entityType: internalEntityType };

    params.properties = !!properties
      ? typeof properties === 'string' ? `id ${properties}` : ['id', ...Array.from(new Set(properties || []))].join(' ') // Always include the `id` property/. Useful for deleting
      : null;

    const queryParamsFromJs = queryParamsEvaluator({
      data: formData ?? {},
      globalState: globalState,
      query: getQueryParams(),
    });
    if (queryParams) {
      params = { ...params, ...(typeof queryParamsFromJs === 'object' ? queryParamsFromJs : {}) };
    }
    
    if (!params.id && !!value && !!value['id'])
      params.id = value['id'];

    return params;
  };

  const finalQueryParams = useDeepCompareMemoKeepReference(() => {
    const result = getFinalQueryParams();
    return result;
  }, [queryParams, formMode, globalState, formData]);

  // abort controller, is used to cancel out of date data requests
  const dataRequestAbortController = useRef<AbortController>(null);

  const fetchData = (forceFetchData: boolean = false) => {
    if (dataSource !== 'api') {
      return;
    }

    // Skip loadng if entity with this Id is already fetched
    if (!forceFetchData && finalQueryParams?.id === state.fetchedEntityId) {
      return;
    }

    if (dataRequestAbortController.current) dataRequestAbortController.current.abort('out of date');

    // Skip loading if we work with entity and the `id` is not specified
    if (internalEntityType && !finalQueryParams?.id) {
      return;
    }

    // NOTE: getUrl may be null and a real URL according to the entity type or other params
    //if (!getUrl) return;

    dataRequestAbortController.current = new AbortController();

    dispatch(fetchDataRequestAction());
    getReadUrl().then((getUrl) => {
      if (!Boolean(getUrl)) {
        dispatch(fetchDataSuccessAction({entityId: undefined}));
        return;
      }

      RestfulShesha.get<EntityAjaxResponse, any, any, any>(
        getUrl,
        finalQueryParams,
        { base: backendUrl, headers: httpHeaders },
        dataRequestAbortController.current.signal
      )
        .then((dataResponse) => {
          if (dataRequestAbortController.current?.signal?.aborted) return;

          dataRequestAbortController.current = null;

          if (dataResponse.success) {
            onChangeInternal(dataResponse?.result);
            dispatch(fetchDataSuccessAction({entityId: dataResponse?.result?.id}));
          } else {
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
  }, [dataSource, finalQueryParams]); // todo: memoize final getUrl and add as a dependency

  const postData = useDebouncedCallback(() => {
    if (!postUrl) {
      notification.error({
        placement: 'top',
        message: 'postUrl missing',
        description: 'Please make sure you have specified the POST URL',
      });
    } else {
      postHttp(value).then((submittedValue) => {
        onChangeInternal(submittedValue?.result);
        if (onCreated) {
          const evaluateOnCreated = () => {
            // tslint:disable-next-line:function-constructor
            return new Function('data, globalState, submittedValue, message, publish, application', onCreated)(
              formData,
              globalState,
              submittedValue?.result,
              message,
              publish,
              appContextData,
            );
          };

          evaluateOnCreated();
        }
      });
    }
  }, 300);

  const putData = useDebouncedCallback(() => {
    if (!putUrl) {
      notification.error({
        placement: 'top',
        message: 'putUrl missing',
        description: 'Please make sure you have specified the PUT URL',
      });
    } else {
      putHttp(value).then((submittedValue) => {
        onChangeInternal(submittedValue?.result);
        if (onUpdated) {
          const evaluateOnUpdated = () => {
            // tslint:disable-next-line:function-constructor
            return new Function('data, globalState, response, message, publish', onUpdated)(
              formData,
              globalState,
              submittedValue?.result,
              message,
              publish
            );
          };

          evaluateOnUpdated();
        }
      });
    }
  }, 300);
  //#endregion

  const designerComponents = useFormDesignerComponents();

  const setMarkup = (payload: IPersistedFormPropsWithComponents) => {
    const flatStructure = componentsTreeToFlatStructure(designerComponents, payload.components);
    upgradeComponents(designerComponents, payload.formSettings, flatStructure);
    const tree = componentsFlatStructureToTree(designerComponents, flatStructure);

    dispatch(
      setMarkupWithSettingsAction({
        ...payload,
        components: tree,
        ...flatStructure,
      })
    );
  };

  //#region Fetch Form
  useDeepCompareEffect(() => {
    if (formConfig.formId && !markup) {
      setFormLoadingState({ isLoading: true, error: null });

      getForm({ formId: formConfig.formId, skipCache: false, configurationItemMode: configurationItemMode })
        .then((response) => {
          setFormLoadingState({ isLoading: false, error: null });

          setMarkup({
            hasFetchedConfig: true,
            id: response?.id,
            module: response?.module,
            name: response?.name,
            components: response.markup,
            formSettings: response.settings,
            versionNo: response?.versionNo,
            versionStatus: response?.versionStatus,
            description: response?.description,
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

  const getChildComponents = (componentId: string) => {
    
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
        debouncedFetchData(true); // todo: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Post form data',
      owner: componentName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        postData(); // todo: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Update form data',
      owner: componentName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        putData(); // todo: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  //#endregion

  const getColSpan = (span: number | ColProps): ColProps => {
    if (!span) return null;

    return typeof span === 'number' ? { span } : span;
  };

  return (
    <SubFormContext.Provider
      value={{
        ...state,
        initialValues: value,
        errors: {
          ...state.errors,
          getForm: formLoadingState.error,
          postData: postError,
          putData: updateError,
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
        context
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
        <ParentProvider model={props} subFormIdPrefix={id} context={context}>
          {children}
        </ParentProvider>
      </SubFormActionsContext.Provider>
    </SubFormContext.Provider>
  );
};

function useSubFormState(require: boolean) {
  const context = useContext(SubFormContext);

  if (context === undefined && require) {
    throw new Error('useSubFormState must be used within a SubFormProvider');
  }

  return context;
}

function useSubFormActions(require: boolean) {
  const context = useContext(SubFormActionsContext);

  if (context === undefined && require) {
    throw new Error('useSubFormActions must be used within a SubFormProvider');
  }

  return context;
}

function useSubForm(require: boolean = true) {
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
