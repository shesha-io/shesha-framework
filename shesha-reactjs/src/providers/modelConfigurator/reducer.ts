import { handleActions } from 'redux-actions';
import { EntityInitFlags, ModelConfigurationDto } from '@/apis/modelConfigurations';
import { ModelActionEnums } from './actions';
import { IModelConfiguratorStateContext, MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE } from './contexts';
import { IErrorInfo } from '@/interfaces';

const prepareLoadedData = (data: ModelConfigurationDto): ModelConfigurationDto => {
  return {
    ...data,
    properties: data.properties
      .filter((p) => !p.isFrameworkRelated), // remove framework fields
  };
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
      };

      if (payload.initStatus & (EntityInitFlags.DbActionFailed | EntityInitFlags.InitializationFailed)) { // eslint-disable-line no-bitwise
        newState.errors = [
          payload.initMessage,
          ...(preparedData.properties
            .filter((p) => p.initStatus & (EntityInitFlags.DbActionFailed | EntityInitFlags.InitializationFailed)) // eslint-disable-line no-bitwise
            ?.map((p) => `${p.name}: ${p.initMessage}`) ?? []),
        ];
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

      return {
        ...state,
        isCreateNew: false,
        isModified: false,
        isSaving: false,
        id: payload.id,
        modelConfiguration: prepareLoadedData(payload),
      };
    },

    [ModelActionEnums.SaveError]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<IErrorInfo>,
    ) => {
      return {
        ...state,
        isSaving: false,
        errors: [action.payload?.message, ...(action.payload?.validationErrors?.map((e) => e.message) ?? [])],
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
      action: ReduxActions.Action<string[]>,
    ) => {
      return {
        ...state,
        errors: action.payload,
      };
    },


  },

  MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE,
);

export default modelReducer;
