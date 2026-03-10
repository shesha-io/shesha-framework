import { FormInstance } from 'antd';
import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import {
  ModelConfigurationDto,
  entityConfigDelete,
  modelConfigurationsCreate,
  modelConfigurationsUpdate,
} from '@/apis/modelConfigurations';
import { useHttpClient, useSheshaApplication } from '@/providers';
import {
  cancelAction,
  changeModelIdAction,
  createNewAction,
  deleteErrorAction,
  deleteRequestAction,
  deleteSuccessAction,
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
import { IAjaxResponse, isAjaxErrorResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { propertyModelValidator, validateDuplicated } from '@/components/modelConfigurator/propertiesEditor/renderer/propertySettings/propertyModelValidator';

export interface IModelConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface IModelConfiguratorProviderProps {
  id?: string;
  form: FormInstance;
}

const ModelConfiguratorProvider: FC<PropsWithChildren<IModelConfiguratorProviderProps>> = (props) => {
  const { children } = props;

  const { backendUrl, httpHeaders } = useSheshaApplication();
  const httpClient = useHttpClient();

  const [state, dispatch] = useReducer(modelReducer, {
    ...MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE,
    id: props.id,
    form: props.form,
  });

  const load = (): void => {
    if (state.id) {
      dispatch(loadRequestAction());

      httpClient.get<IAjaxResponse<ModelConfigurationDto>>(`/api/ModelConfigurations/${state.id}`)
        .then((response) => {
          if (isAjaxSuccessResponse(response.data))
            dispatch(loadSuccessAction(response.data.result));
          else
            dispatch(loadErrorAction(response.data.error));
        })
        .catch((e) => {
          if (isAjaxErrorResponse(e.response?.data))
            dispatch(loadErrorAction(e.response.data.error));
          else
            dispatch(loadErrorAction({ message: 'Failed to load model' }));
        });
    }
  };

  useEffect(() => {
    load();
  }, [state.id]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const changeModelId = (id: string): void => {
    dispatch(changeModelIdAction(id));
  };

  const createNew = (model: ModelConfigurationDto): void => {
    dispatch(createNewAction(model));
  };

  const submit = (): void => {
    state.form.submit();
  };

  const prepareValues = (values: ModelConfigurationDto): ModelConfigurationDto => {
    return state.id
      ? { ...values, id: state.id }
      : { ...values, className: values.name, namespace: values.module };
  };

  const validateModel = (model: ModelConfigurationDto): IPropertyErrors[] => {
    let errors: IPropertyErrors[] = validateDuplicated(model.properties, '');
    model.properties?.forEach((prop) => {
      errors = errors.concat(propertyModelValidator(prop));
    });

    dispatch(setErrorsAction(errors));

    return errors;
  };

  const save = (values: ModelConfigurationDto): Promise<ModelConfigurationDto> =>
    new Promise<ModelConfigurationDto>((resolve, reject) => {
      const errors = validateModel(values);
      if (errors.length > 0) {
        dispatch(setShowErrorsAction(true));
        reject();
        return;
      }

      const preparedValues = prepareValues(values);

      dispatch(setErrorsAction([]));
      dispatch(saveRequestAction());

      const mutate = state.id ? modelConfigurationsUpdate : modelConfigurationsCreate;

      mutate(preparedValues, { base: backendUrl, headers: httpHeaders })
        .then((response) => {
          if (isAjaxSuccessResponse(response)) {
            dispatch(saveSuccessAction(response.result));
            resolve(response.result);
          } else {
            dispatch(saveErrorAction(response.error));
            reject();
          }
        })
        .catch((error) => {
          dispatch(saveErrorAction({ message: 'Failed to save model', details: error }));
          reject();
        });
    });

  const cancel = (): void => {
    dispatch(cancelAction());
  };

  const getModelSettings = (): ModelConfigurationDto => prepareValues(state.form.getFieldsValue());

  const saveForm: () => Promise<ModelConfigurationDto> = () =>
    new Promise<ModelConfigurationDto>((resolve, reject) => {
      state.form
        .validateFields()
        .then((values) => {
          // merge values to avoid losing invisible data
          save({ ...state.modelConfiguration, ...values })
            .then((item) => resolve(item))
            .catch(() => reject());
        })
        .catch((error) => reject(error));
    });

  const deleteFunc = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      dispatch(deleteRequestAction());

      entityConfigDelete({ base: backendUrl, queryParams: { id: state.modelConfiguration?.id }, headers: httpHeaders })
        .then(() => {
          dispatch(deleteSuccessAction());
          resolve();
        })
        .catch((error) => {
          dispatch(deleteErrorAction({ message: 'Failed to save model', details: error }));
          reject();
        });
    });

  const setModified = (isModified?: boolean): void => {
    dispatch(setModifiedAction(isModified ?? true));
  };

  return (
    <ModelConfiguratorStateContext.Provider value={{ ...state }}>
      <ModelConfiguratorActionsContext.Provider
        value={{
          changeModelId,
          load,
          save,
          saveForm,
          submit,
          getModelSettings,
          cancel,
          delete: deleteFunc,
          createNew,
          setModified,
          validateModel,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </ModelConfiguratorActionsContext.Provider>
    </ModelConfiguratorStateContext.Provider>
  );
};

function useModelConfiguratorState(): IModelConfiguratorStateContext {
  const context = useContext(ModelConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useModelConfiguratorState must be used within a ModelConfiguratorProvider');
  }

  return context;
}

function useModelConfiguratorActions(): IModelConfiguratorActionsContext {
  const context = useContext(ModelConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error('useModelConfiguratorActions must be used within a ModelConfiguratorProvider');
  }

  return context;
}

function useModelConfigurator(): IModelConfiguratorStateContext & IModelConfiguratorActionsContext {
  return { ...useModelConfiguratorState(), ...useModelConfiguratorActions() };
}

export { ModelConfiguratorProvider, useModelConfigurator };
