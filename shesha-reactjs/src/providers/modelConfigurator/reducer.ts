import { EntityInitFlags, ModelConfigurationDto } from '@/apis/modelConfigurations';
import {
  loadErrorAction,
  loadRequestAction,
  loadSuccessAction,
  saveErrorAction,
  saveRequestAction,
  saveSuccessAction,
  setErrorsAction,
  setModifiedAction,
  setShowErrorsAction } from './actions';
import { IModelConfiguratorStateContext, MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE, ModelConfigurationError } from './contexts';
import { DataTypes, IErrorInfo } from '@/interfaces';
import { EntityFormats } from '@/interfaces/dataTypes';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { createReducer } from '@reduxjs/toolkit';

const prepareLoadedData = (data: ModelConfigurationDto): ModelConfigurationDto => {
  return {
    ...data,
    properties: data.properties
      .filter((p) => !p.isFrameworkRelated) // remove framework fields
      .map((p) => {
        const prop = { ...p };
        if (p.dataType === DataTypes.entityReference && p.dataFormat === EntityFormats.genericEntity)
          prop.genericEntityReference = true;
        prop.allowEdit = !p.createdInDb && !p.inheritedFromId && p.source !== 1;
        return prop;
      }),
  };
};

const extractInitErrors = (payload: ModelConfigurationDto, preparedData: ModelConfigurationDto): ModelConfigurationError[] => {
  const errors: ModelConfigurationError[] = [];
  if (isDefined(payload.initStatus) && payload.initStatus & (EntityInitFlags.DbActionFailed | EntityInitFlags.InitializationFailed)) { // eslint-disable-line no-bitwise
    if (!isNullOrWhiteSpace(payload.initMessage))
      errors.push(payload.initMessage);
    preparedData.properties.forEach((p) => {
      if (isDefined(p.initStatus) && p.initStatus & (EntityInitFlags.DbActionFailed | EntityInitFlags.InitializationFailed))// eslint-disable-line no-bitwise
        errors.push({ propertyName: p.name, errors: [p.initMessage ?? "Unknown error"] });
    });
  }
  return errors;
};

const errorIntoToModelErrors = (errorInfo: IErrorInfo): ModelConfigurationError[] => {
  const errors: ModelConfigurationError[] = [];
  if (!isNullOrWhiteSpace(errorInfo.message))
    errors.push(errorInfo.message);
  if (errorInfo.validationErrors)
    errorInfo.validationErrors.forEach((e) => {
      if (!isNullOrWhiteSpace(e.message))
        errors.push(e.message);
    });
  return errors;
};


export const modelReducer = createReducer(MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(loadRequestAction, (state) => {
      state.isLoading = true;
    })
    .addCase(loadSuccessAction, (state, { payload }) => {
      const preparedData = prepareLoadedData(payload);
      const initErrors = extractInitErrors(payload, preparedData);
      const newState = {
        ...state,
        isCreateNew: false,
        modelConfiguration: preparedData,
        initialConfiguration: preparedData,
        isLoading: false,
        showErrors: initErrors.length > 0,
        errors: initErrors.length > 0 ? initErrors : [],
      };

      return newState;
    })
    .addCase(loadErrorAction, (state, { payload }) => {
      return {
        ...state,
        isLoading: false,
        errors: errorIntoToModelErrors(payload),
        showErrors: true,
      };
    })
    .addCase(saveRequestAction, (state) => {
      state.isSaving = true;
    })
    .addCase(saveSuccessAction, (state, { payload }) => {
      const preparedData = prepareLoadedData(payload);
      const initErrors = extractInitErrors(payload, preparedData);
      const newState = {
        ...state,
        isModified: false,
        isSaving: false,
        id: payload.id,
        initialConfiguration: preparedData,
        modelConfiguration: preparedData,
        showErrors: initErrors.length > 0,
        errors: initErrors.length > 0 ? initErrors : [],
      } satisfies IModelConfiguratorStateContext;

      return newState;
    })
    .addCase(saveErrorAction, (state, { payload }) => {
      return {
        ...state,
        isSaving: false,
        errors: errorIntoToModelErrors(payload),
        showErrors: true,
      };
    })
    .addCase(setModifiedAction, (state, { payload }) => {
      state.isModified = payload;
    })
    .addCase(setErrorsAction, (state, { payload }) => {
      return {
        ...state,
        errors: payload,
        showErrors: payload.length > 0,
      };
    })
    .addCase(setShowErrorsAction, (state, { payload }) => {
      state.showErrors = payload;
    })
  ;
});

export default modelReducer;
