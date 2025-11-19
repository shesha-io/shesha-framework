import { handleActions } from 'redux-actions';
import { ModelConfigurationDto } from '@/apis/modelConfigurations';
import { ModelActionEnums } from './actions';
import { IModelConfiguratorStateContext, MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE } from './contexts';

const modelReducer = handleActions<IModelConfiguratorStateContext, any>(
  {
    [ModelActionEnums.CreateNew]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<ModelConfigurationDto>,
    ) => {
      return {
        ...state,
        isCreateNew: true,
        modelConfiguration: action.payload,
        initialConfiguration: action.payload,
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
        // id: payload
      };
    },

    [ModelActionEnums.LoadSuccess]: (
      state: IModelConfiguratorStateContext,
      action: ReduxActions.Action<ModelConfigurationDto>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        isCreateNew: false,
        modelConfiguration: payload,
        initialConfiguration: payload,
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
        id: payload.id,
        modelConfiguration: { ...payload },
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

  },

  MODEL_CONFIGURATOR_CONTEXT_INITIAL_STATE,
);

export default modelReducer;
