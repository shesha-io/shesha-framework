import { handleActions } from 'redux-actions';
import { EntityInitFlags, ModelConfigurationDto } from '@/apis/modelConfigurations';
import { ModelActionEnums } from './actions';
import { IModelConfiguratorStateContext, IPropertyErrors, MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE } from './contexts';
import { DataTypes, IErrorInfo } from '@/interfaces';
import { EntityFormats } from '@/interfaces/dataTypes';

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

const extractInitErrors = (payload: ModelConfigurationDto, preparedData: ModelConfigurationDto): (IPropertyErrors | string)[] => {
  if (payload.initStatus & (EntityInitFlags.DbActionFailed | EntityInitFlags.InitializationFailed)) { // eslint-disable-line no-bitwise
    return [
      payload.initMessage,
      ...(preparedData.properties
        .filter((p) => p.initStatus & (EntityInitFlags.DbActionFailed | EntityInitFlags.InitializationFailed)) // eslint-disable-line no-bitwise
        ?.map((p) => ({ propertyName: p.name, errors: [p.initMessage] } as IPropertyErrors)) ?? []),
    ] as (IPropertyErrors | string)[];
  }
  return [];
};

const modelReducer = handleActions<IModelConfiguratorStateContext, any>(
  {
    [ModelActionEnums.CreateNew]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<ModelConfigurationDto>,
    ) => {
      return {
        ...state,
        isCreateNew: true,
        modelConfiguration: prepareLoadedData(action.payload),
        initialConfiguration: prepareLoadedData(action.payload),
        showErrors: false,
        id: '',
      };
    },

    [ModelActionEnums.ChangeModelId]: (state: IModelConfiguratorStateContext, action: ReduxActions.Action<string>) => {
      if (action.payload) {
        return {
          ...state,
          id: action.payload,
        };
      }
      return {
        ...state,
        isCreateNew: false,
        modelConfiguration: {},
        id: action.payload,
      };
    },

    [ModelActionEnums.LoadRequest]: (state: IModelConfiguratorStateContext) => {
      return {
        ...state,
        isLoading: true,
        // id: payload
      };
    },

    [ModelActionEnums.LoadSuccess]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<ModelConfigurationDto>,
    ) => {
      const { payload } = action;

      const preparedData = prepareLoadedData(payload);

      const newState = {
        ...state,
        isCreateNew: false,
        modelConfiguration: preparedData,
        initialConfiguration: preparedData,
        isLoading: false,
        showErrors: false,
        errors: [],
      };

      const initErrors = extractInitErrors(payload, preparedData);
      if (initErrors.length > 0) {
        newState.errors = initErrors;
        newState.showErrors = true;
      }


      return newState;
    },

    [ModelActionEnums.LoadError]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<IErrorInfo>,
    ) => {
      return {
        ...state,
        isLoading: false,
        errors: [action.payload?.message, ...(action.payload?.validationErrors?.map((e) => e.message) ?? [])],
        showErrors: true,
      };
    },

    [ModelActionEnums.SaveRequest]: (state: IModelConfiguratorStateContext) => {
      return {
        ...state,
        isSaving: true,
        // id: payload
      };
    },

    [ModelActionEnums.SaveSuccess]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<ModelConfigurationDto>,
    ) => {
      const { payload } = action;

      const preparedData = prepareLoadedData(payload);
      const newState = {
        ...state,
        isCreateNew: false,
        isModified: false,
        isSaving: false,
        id: payload.id,
        modelConfiguration: preparedData,
        showErrors: false,
        errors: [],
      };

      const initErrors = extractInitErrors(payload, preparedData);
      if (initErrors.length > 0) {
        newState.errors = initErrors;
        newState.showErrors = true;
      }

      return newState;
    },

    [ModelActionEnums.SaveError]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<IErrorInfo>,
    ) => {
      return {
        ...state,
        isSaving: false,
        errors: [action.payload?.message, ...(action.payload?.validationErrors?.map((e) => e.message) ?? [])],
        showErrors: true,
      };
    },


    [ModelActionEnums.Cancel]: (
      state: IModelConfiguratorStateContext,
    ) => {
      return {
        ...state,
        isCreateNew: false,
      };
    },

    [ModelActionEnums.SetModified]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<boolean>,
    ) => {
      return {
        ...state,
        isModified: action.payload,
      };
    },

    [ModelActionEnums.SetErrors]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<(IPropertyErrors | string)[]>,
    ) => {
      return {
        ...state,
        errors: action.payload,
        showErrors: action.payload.length ? state.showErrors : false,
      };
    },

    [ModelActionEnums.SetShowErrors]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<boolean>,
    ) => {
      return {
        ...state,
        showErrors: action.payload,
      };
    },


  },

  MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE,
);

export default modelReducer;
