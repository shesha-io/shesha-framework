import React, { FC, useReducer, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useGet, useMutate } from 'restful-react';
import { useForm } from '../form';
import { SubFormActionsContext, SubFormContext, SUB_FORM_CONTEXT_INITIAL_STATE } from './contexts';
import { usePubSub } from '../../hooks';
import { uiReducer } from './reducer';
import { getQueryParams } from '../../utils/url';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings } from '../form/models';
import { setMarkupWithSettingsAction } from './actions';
import { ISubFormProps } from './interfaces';
import { ColProps, message, notification } from 'antd';
import { useGlobalState } from '../globalState';
import { EntitiesGetQueryParams, useEntitiesGet } from '../../apis/entities';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepCompareEffect, usePrevious } from 'react-use';
import { IEntity } from '../../pages/dynamic/interfaces';
import { UseFormConfigurationArgs } from '../form/api';
import { useConfigurableAction } from '../configurableActionsDispatcher';
import { useConfigurationItemsLoader } from '../configurationItemsLoader';
import { useAppConfigurator } from '../..';

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

const SubFormProvider: FC<SubFormProviderProps> = ({
  formSelectionMode,
  formType,
  children,
  value,
  formId,
  getUrl,
  postUrl,
  putUrl,
  beforeGet,
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
  entityType,
  onChange,
  defaultValue,
}) => {
  const [state, dispatch] = useReducer(uiReducer, SUB_FORM_CONTEXT_INITIAL_STATE);
  const { publish } = usePubSub();
  const { formData = {}, formMode } = useForm();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const [formConfig, setFormConfig] = useState<UseFormConfigurationArgs>({ formId, lazy: true });

  const getEvaluatedUrl = (url: string): string => {
    if (!url) return '';
    return (() => {
      // tslint:disable-next-line:function-constructor
      return new Function('data, query, globalState', url)(formData, getQueryParams(), globalState); // Pass data, query, globalState
    })();
  };

  const queryParamPayload = useMemo<IEntity>(() => {
    const getQueryParamPayload = () => {
      try {
        // tslint:disable-next-line:function-constructor
        return new Function('data, query, globalState', queryParams)(formData, getQueryParams(), globalState); // Pass data, query, globalState
      } catch (error) {
        console.warn('queryParamPayload error: ', error);
        return {};
      }
    };

    return getQueryParamPayload();
  }, [queryParams, formData, globalState]);

  useDeepCompareEffect(() => {
    if (name) {
      setGlobalState({
        key: name,
        data: value,
      });
    }
  }, [value, name]);

  const [formLoadingState, setFormLoadingState] = useState<IFormLoadingState>({ isLoading: false, error: null });

  const { getForm } = useConfigurationItemsLoader();
  const { configurationItemMode } = useAppConfigurator();

  const { getEntityFormId } = useConfigurationItemsLoader();

  useEffect(() => {
    setFormConfig({ formId, lazy: true });
  }, [formId]);

  // show form based on the entity type
  useEffect(() => {
    if (formData && formSelectionMode == 'dynamic') {
      const obj = formData[name];
      if (obj && typeof obj === 'object' && obj['_className'] && !formConfig?.formId)
        getEntityFormId(obj['_className'], formType, formid => {
          setFormConfig({ formId: { name: formid.name, module: formid.module }, lazy: true });
        });
    }
  }, [formData]);

  const {
    refetch: fetchEntity,
    data: fetchEntityResponse,
    loading: isFetchingEntity,
    error: fetchEntityError,
  } = useEntitiesGet({ lazy: true });

  const { initialValues } = useSubForm();

  const {
    refetch: fetchDataByUrlHttp,
    data: fetchDataByUrl,
    loading: isFetchingDataByUrl,
    error: errorFetchingData,
  } = useGet({
    path: getEvaluatedUrl(getUrl) ?? '',
    queryParams: queryParamPayload,
    lazy: true,
  });

  const previousValue = useRef(value);

  useDeepCompareEffect(() => {
    if (typeof value === 'string' && typeof previousValue === 'string' && previousValue !== value) {
      handleFetchData(value);
    }
  }, [value, globalState, formData]);

  useDeepCompareEffect(() => {
    if (!isFetchingDataByUrl && fetchDataByUrl && typeof onChange === 'function') {
      onChange(fetchDataByUrl?.result);
    }
  }, [isFetchingDataByUrl, fetchDataByUrl]);

  const evaluatedQueryParams = useMemo(() => {
    if (formMode === 'designer') return {};

    let params: EntitiesGetQueryParams = {
      entityType,
    };

    params.properties =
      typeof properties === 'string' ? `id ${properties}` : ['id', ...Array.from(new Set(properties || []))].join(' '); // Always include the `id` property/. Useful for deleting

    if (queryParams) {
      params = { ...params, ...(typeof queryParamPayload === 'object' ? queryParamPayload : {}) };
    }

    return params;
  }, [queryParams, formMode, globalState]);

  const handleFetchData = (id?: string) => {
    if (id || evaluatedQueryParams?.id) {
      fetchEntity({ queryParams: id ? { ...evaluatedQueryParams, id } : evaluatedQueryParams });
    }
  };

  useDeepCompareEffect(() => {
    if (queryParams && formMode !== 'designer' && dataSource === 'api') {
      if (evaluatedQueryParams?.id || getUrl) {
        // Only fetch when there's an `Id`. Ideally an API that is used to fetch data should have an id
        handleFetchData();
      } else {
        onChange({});
      }
    }
  }, [queryParams, evaluatedQueryParams]);

  const previousGetUrl = usePrevious(getUrl);

  useDeepCompareEffect(() => {
    if (
      dataSource === 'api' &&
      getUrl &&
      previousGetUrl !== getUrl &&
      !getEvaluatedUrl(getUrl)?.includes('undefined')
    ) {
      if (Object.hasOwn(queryParamPayload, 'id') && (!queryParamPayload?.id || queryParamPayload?.id === 'undefined')) {
        return;
      }
      // TODO: when the string returned by the function has undefined , this causes the call to be made and this causes server-side error
      // TODO: Find a cleaner way to check if new Function evaluated to a string that has undefined
      fetchDataByUrlHttp();
    }
  }, [properties, getUrl, dataSource]);

  const { mutate: postHttp, loading: isPosting, error: postError } = useMutate({
    path: getEvaluatedUrl(postUrl),
    verb: 'POST',
  });

  const { mutate: putHttp, loading: isUpdating, error: updateError } = useMutate({
    path: getEvaluatedUrl(putUrl),
    verb: 'PUT',
  });

  //#region get data
  useDeepCompareEffect(() => {
    if (!isFetchingEntity && fetchEntityResponse) {
      onChange(fetchEntityResponse?.result);
    }
  }, [isFetchingEntity, fetchEntityResponse]);
  //#endregion

  //#region CRUD functions
  const getData = useDebouncedCallback(() => {
    if (dataSource === 'api') {
      if (beforeGet) {
        const evaluateBeforeGet = () => {
          // tslint:disable-next-line:function-constructor
          return new Function('data, initialValues, globalState', beforeGet)(formData, initialValues, globalState);
        };

        const evaluatedData = evaluateBeforeGet();

        onChange(evaluatedData);
      }

      handleFetchData();
    }
  }, 300);

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

  useDeepCompareEffect(() => {
    if (markup) {
      dispatch(setMarkupWithSettingsAction(markup));
    }
  }, [markup]);
  //#endregion

  const actionDependencies = [actionsOwnerId];
  useConfigurableAction(
    {
      name: 'Get form data',
      owner: actionOwnerName,
      ownerUid: actionsOwnerId,
      hasArguments: false,
      executer: () => {
        getData(); // todo: return real promise
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
        initialValues: value,
        errors: {
          getForm: formLoadingState.error,
          postData: postError,
          getData: fetchEntityError || errorFetchingData,
          putData: updateError,
        },
        loading: {
          getForm: formLoadingState.isLoading,
          postData: isPosting,
          getData: isFetchingEntity || isFetchingDataByUrl,
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
          getData,
          postData,
          putData,
        }}
      >
        {children}
      </SubFormActionsContext.Provider>
    </SubFormContext.Provider>
  );
};

function useSubFormState() {
  const context = useContext(SubFormContext);

  // if (context === undefined) {
  //   throw new Error('useSubFormState must be used within a SubFormProvider');
  // }

  return context;
}

function useSubFormActions() {
  const context = useContext(SubFormActionsContext);

  // if (context === undefined) {
  //   throw new Error('useSubFormActions must be used within a SubFormProvider');
  // }

  return context;
}

function useSubForm() {
  return { ...useSubFormState(), ...useSubFormActions() };
}

export { SubFormProvider, useSubFormState, useSubFormActions, useSubForm };
