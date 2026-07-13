import { FormInstance } from 'antd';
import React, { FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import {
  ModelConfigurationDto,
} from '@/apis/modelConfigurations';
import { useEntityMetadataFetcher, useHttpClient, useMetadataDispatcher } from '@/providers';
import {
  loadErrorAction,
  loadRequestAction,
  loadSuccessAction,
  saveErrorAction,
  saveRequestAction,
  saveSuccessAction,
  setErrorsAction,
  setModifiedAction,
  setShowErrorsAction,
} from './actions';
import {
  IModelConfiguratorActionsContext,
  IModelConfiguratorStateContext,
  IPropertyErrors,
  MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE,
  ModelConfiguratorActionsContext,
  ModelConfiguratorStateContext,
} from './contexts';
import modelReducer from './reducer';
import { extractAjaxResponse, IAjaxResponse } from '@/interfaces/ajaxResponse';
import { propertyModelValidator, validateDuplicated } from '@/components/modelConfigurator/propertiesEditor/renderer/propertySettings/propertyModelValidator';
import { extractErrorInfo, throwError } from '@/utils/errors';

export interface IModelConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface IModelConfiguratorProviderProps {
  id: string;
  form: FormInstance<ModelConfigurationDto>;
}

const ModelConfiguratorProvider: FC<PropsWithChildren<IModelConfiguratorProviderProps>> = (props) => {
  const { children, form } = props;

  const httpClient = useHttpClient();
  const metadataFetcher = useEntityMetadataFetcher();
  const metadataDispatcher = useMetadataDispatcher();

  const [state, dispatch] = useReducer(modelReducer, {
    ...MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE,
    id: props.id,
  });

  const load = useCallback(async (): Promise<void> => {
    if (state.id) {
      dispatch(loadRequestAction());

      try {
        const response = await httpClient.get<IAjaxResponse<ModelConfigurationDto>>(`/api/ModelConfigurations/${state.id}`);
        const responseData = extractAjaxResponse(response.data);
        dispatch(loadSuccessAction(responseData));
      } catch (error: unknown) {
        console.error(error);
        dispatch(loadErrorAction(extractErrorInfo(error) ?? { message: 'Failed to load model' }));
      }
    }
  }, [httpClient, state.id]);

  useEffect(() => {
    load().catch((error) => {
      console.error('Failed to fetch model', error);
    });
  }, [load, state.id]);

  const submit = useCallback((): void => {
    form.submit();
  }, [form]);

  const prepareValues = useCallback((values: ModelConfigurationDto): ModelConfigurationDto => {
    return state.id
      ? { ...values, id: state.id }
      : { ...values, className: values.name, namespace: values.module };
  }, [state.id]);

  const validateModel = useCallback((model: ModelConfigurationDto): IPropertyErrors[] => {
    const errors: IPropertyErrors[] = validateDuplicated(model.properties, '');
    model.properties.forEach((prop) => {
      errors.push(...propertyModelValidator(prop));
    });

    dispatch(setErrorsAction(errors));

    return errors;
  }, []);

  const save = useCallback(async (values: ModelConfigurationDto): Promise<ModelConfigurationDto> => {
    const errors = validateModel(values);
    if (errors.length > 0) {
      dispatch(setShowErrorsAction(true));
      throw new Error('Validation failed');
    }

    const preparedValues = prepareValues(values);

    dispatch(setErrorsAction([]));
    dispatch(saveRequestAction());

    try {
      const response = await httpClient.put<IAjaxResponse<ModelConfigurationDto>>("/api/ModelConfigurations", preparedValues);
      const responseData = extractAjaxResponse(response.data);
      dispatch(saveSuccessAction(responseData));

      try {
        await metadataFetcher.resetSynchronized();
        metadataDispatcher.clearModels();
      } catch (metadataError) {
        console.error('Failed to reset metadata cache after save', metadataError);
      }

      return responseData;
    } catch (error: unknown) {
      console.error(error);
      dispatch(saveErrorAction(extractErrorInfo(error) ?? { message: 'Failed to save model' }));
      throw error;
    }
  }, [httpClient, prepareValues, validateModel, metadataFetcher, metadataDispatcher]);

  const getModelSettings = useCallback((): ModelConfigurationDto => {
    return prepareValues(form.getFieldsValue());
  }, [form, prepareValues]);

  const getForm = useCallback((): FormInstance<ModelConfigurationDto> => {
    return form;
  }, [form]);

  const saveForm = useCallback(async (): Promise<ModelConfigurationDto> => {
    const values = await form.validateFields();

    // merge values to avoid losing invisible data
    const item = await save({ ...state.modelConfiguration, ...values });
    return item;
  }, [form, save, state.modelConfiguration]);


  const setModified = useCallback((isModified: boolean): void => {
    dispatch(setModifiedAction(isModified));
  }, []);

  const actions: IModelConfiguratorActionsContext = useMemo(() => (
    {
      load,
      save,
      getForm,
      saveForm,
      submit,
      getModelSettings,
      setModified,
      validateModel,
    }
  ), [getForm, load, save, saveForm, submit, getModelSettings, setModified, validateModel]);

  return (
    <ModelConfiguratorStateContext.Provider value={state}>
      <ModelConfiguratorActionsContext.Provider
        value={actions}
      >
        {children}
      </ModelConfiguratorActionsContext.Provider>
    </ModelConfiguratorStateContext.Provider>
  );
};

const useModelConfiguratorState = (): IModelConfiguratorStateContext => useContext(ModelConfiguratorStateContext) ?? throwError("useModelConfiguratorState must be used within a ModelConfiguratorProvider");

const useModelConfiguratorActions = (): IModelConfiguratorActionsContext => useContext(ModelConfiguratorActionsContext) ?? throwError("useModelConfiguratorActions must be used within a ModelConfiguratorProvider");

const useModelConfigurator = (): IModelConfiguratorStateContext & IModelConfiguratorActionsContext => {
  return { ...useModelConfiguratorState(), ...useModelConfiguratorActions() };
};

export { ModelConfiguratorProvider, useModelConfigurator };
