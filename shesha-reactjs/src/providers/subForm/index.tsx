import React, { FC, useReducer, useContext, useEffect, useMemo, useRef, useState, PropsWithChildren } from 'react';
import { GetDataError, useMutate } from 'hooks';
import { useForm } from '../form';
import { SubFormActionsContext, SubFormContext, SUB_FORM_CONTEXT_INITIAL_STATE } from './contexts';
import { useDeepCompareMemoKeepReference, usePubSub } from '../../hooks';
import { subFormReducer } from './reducer';
import { getQueryParams } from 'utils/url';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings } from '../form/models';
import {
  setMarkupWithSettingsAction,
  fetchDataRequestAction,
  fetchDataSuccessAction,
  fetchDataErrorAction,
} from './actions';
import { ISubFormProps } from './interfaces';
import { ColProps, message, notification } from 'antd';
import { useGlobalState } from '../globalState';
import { EntitiesGetQueryParams } from 'apis/entities';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepCompareEffect } from 'react-use';
import { EntityAjaxResponse } from 'pages/dynamic/interfaces';
import { UseFormConfigurationArgs } from '../form/api';
import { useConfigurableAction } from '../configurableActionsDispatcher';
import { useConfigurationItemsLoader } from '../configurationItemsLoader';
import { executeScript, IAnyObject, QueryStringParams, useAppConfigurator, useSheshaApplication } from '../..';
import * as RestfulShesha from 'utils/fetchers';
import { useModelApiHelper } from 'components/configurableForm/useActionEndpoint';
import { StandardEntityActions } from 'interfaces/metadata';

export interface SubFormProviderProps extends Omit<ISubFormProps, 'name' | 'value'> {
  actionsOwnerId?: string;
  actionOwnerName?: string;
  name?: string;
  markup?: FormMarkupWithSettings;
  value?: string | { id: string; [key: string]: any };
}

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

const SubFormProvider: FC<PropsWithChildren<SubFormProviderProps>> = ({
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
  actionsOwnerId,
  actionOwnerName,
  dataSource,
  markup,
  properties,
  name,
  labelCol,
  wrapperCol,
  queryParams,
  onChange,
  defaultValue,
  entityType
}) => {
  const [state, dispatch] = useReducer(subFormReducer, SUB_FORM_CONTEXT_INITIAL_STATE);
  const { publish } = usePubSub();
  const { formData = {}, formMode } = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const [formConfig, setFormConfig] = useState<UseFormConfigurationArgs>({ formId, lazy: true });

  const { backendUrl, httpHeaders } = useSheshaApplication();

  /**
   * Evaluate url using js expression
   *
   * @urlExpression - javascript expression that returns an url
   */
  const evaluateUrlFromJsExpression = (urlExpression: string): string => {
    if (!urlExpression) return '';
    return (() => {
      // tslint:disable-next-line:function-constructor
      return new Function('data, query, globalState', urlExpression)(formData, getQueryParams(), globalState); // Pass data, query, globalState
    })();
  };

  const evaluateUrl = (urlExpression: string): Promise<string> => {
    if (!urlExpression) return Promise.resolve('');

    return executeScript<string>(urlExpression, {
      data: formData,
      query: getQueryParams(),
      globalState: globalState,
    });
  };

  // update global state on value change
  useDeepCompareEffect(() => {
    if (name) {
      // Note: don't write undefined if subform value is missing in the globalState. It doesn't make any sense but initiates a re-rendering
      const existsInGlobalState = Boolean(globalState) && globalState.hasOwnProperty(name);
      if (value === undefined && !existsInGlobalState) return;

      setGlobalState({
        key: name,
        data: value,
      });
    }
  }, [value, name]);

  const [internalEntityType, setInternalEntityType] = useState(entityType);

  useEffect(() => {
    if (!Boolean(internalEntityType)) {
      if (Boolean(entityType)) {
        setInternalEntityType(entityType);
      } else 
      if (value && typeof value === 'object' && value['_className']) {
        setInternalEntityType(value['_className']);
      }
    } else {
      if (Boolean(entityType) && internalEntityType !== entityType) {
        setInternalEntityType(entityType);
      } else
      if (value && typeof value === 'object' && value['_className'] && internalEntityType !== value['_className']) {
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
          .then(endpoint => endpoint.url)
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
        getEntityFormId(value['_className'], formType, formid => {
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

    return args => {
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

    params.properties =
      typeof properties === 'string' ? `id ${properties}` : ['id', ...Array.from(new Set(properties || []))].join(' '); // Always include the `id` property/. Useful for deleting

    const queryParamsFromJs = queryParamsEvaluator({
      data: formData ?? {},
      globalState: globalState,
      query: getQueryParams(),
    });
    if (queryParams) {
      params = { ...params, ...(typeof queryParamsFromJs === 'object' ? queryParamsFromJs : {}) };
    }

    return params;
  };

  const finalQueryParams = useDeepCompareMemoKeepReference(() => {
    const result = getFinalQueryParams();
    return result;
  }, [queryParams, formMode, globalState, formData]);

  // abort controller, is used to cancel out of date data requests
  const dataRequestAbortController = useRef<AbortController>(null);

  const fetchData = () => {
    if (dataSource !== 'api') {
      return;
    }

    if (dataRequestAbortController.current) dataRequestAbortController.current.abort('out of date');

    // Skip loading if we work with entity and the `id` is not specified
    if (internalEntityType && !finalQueryParams?.id) {
      onChange({});
      return;
    }

    // NOTE: getUrl may be null and a real URL according to the entity type or other params
    //if (!getUrl) return; 

    dataRequestAbortController.current = new AbortController();

    dispatch(fetchDataRequestAction());
    getReadUrl().then(getUrl => {
      if (!Boolean(getUrl)) {
        dispatch(fetchDataSuccessAction());
        return;
      }

      RestfulShesha.get<EntityAjaxResponse, any, any, any>(
        getUrl,
        finalQueryParams,
        { base: backendUrl, headers: httpHeaders },
        dataRequestAbortController.current.signal
      )
        .then(dataResponse => {
          if (dataRequestAbortController.current?.signal?.aborted) return;

          dataRequestAbortController.current = null;

          if (dataResponse.success) {
            if (typeof onChange === 'function') {
              onChange(dataResponse?.result);
              dispatch(fetchDataSuccessAction());
            }
          } else {
            dispatch(fetchDataErrorAction({ error: dataResponse.error as GetDataError<unknown> }));
          }
        })
        .catch(e => {
          dispatch(fetchDataErrorAction({ error: e }));
        });
    });
  };

  const debouncedFetchData = useDebouncedCallback(() => {
    fetchData();
  }, 300);

  // fetch data on first rendering and on change of some properties
  useDeepCompareEffect(() => {
    if (dataSource === 'api')
      fetchData();
  }, [dataSource, finalQueryParams]); // todo: memoize final getUrl and add as a dependency

  const postData = useDebouncedCallback(() => {
    if (!postUrl) {
      notification.error({
        placement: 'top',
        message: 'postUrl missing',
        description: 'Please make sure you have specified the POST URL',
      });
    } else {
      postHttp(value).then(submittedValue => {
        onChange(submittedValue?.result);
        if (onCreated) {
          const evaluateOnCreated = () => {
            // tslint:disable-next-line:function-constructor
            return new Function('data, globalState, submittedValue, message, publish', onCreated)(
              formData,
              globalState,
              submittedValue?.result,
              message,
              publish
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
      putHttp(value).then(submittedValue => {
        onChange(submittedValue?.result);
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

  //#region Fetch Form
  useDeepCompareEffect(() => {
    if (formConfig.formId && !markup) {
      setFormLoadingState({ isLoading: true, error: null });

      getForm({ formId: formConfig.formId, skipCache: false, configurationItemMode: configurationItemMode })
        .then(response => {
          setFormLoadingState({ isLoading: false, error: null });

          dispatch(
            setMarkupWithSettingsAction({
              hasFetchedConfig: true,
              id: response?.id,
              module: response?.module,
              components: response.markup,
              formSettings: response.settings,
              versionNo: response?.versionNo,
              versionStatus: response?.versionStatus,
              description: response?.description,
            })
          );
        })
        .catch(e => {
          setFormLoadingState({ isLoading: false, error: e });
        });
    }

    if (!formConfig.formId && markup) {
      dispatch(setMarkupWithSettingsAction(markup));
    }

    if (!formConfig.formId && !markup) {
      dispatch(setMarkupWithSettingsAction({ components: [], formSettings: DEFAULT_FORM_SETTINGS }));
    }
  }, [formConfig.formId, markup]);
  //#endregion

  const actionDependencies = [actionsOwnerId];
  useConfigurableAction(
    {
      name: 'Get form data',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        debouncedFetchData(); // todo: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies
  );

  useConfigurableAction(
    {
      name: 'Post form data',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
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
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
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
        name,
        value: value || defaultValue,
      }}
    >
      <SubFormActionsContext.Provider
        value={{
          getData: debouncedFetchData,
          postData,
          putData,
        }}
      >
        {children}
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

export { SubFormProvider, useSubFormState, useSubFormActions, useSubForm };
