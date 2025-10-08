import { FormMode } from '@/interfaces';
import { handleActions } from 'redux-actions';
import {
  IEditorBridge,
  IFetchApplicationsErrorPayload,
  IFetchApplicationsSuccessPayload,
  IFetchConfigurationsErrorPayload,
  IFetchConfigurationsSuccessPayload,
  ISettingsEditorStateContext,
  ISettingSelection,
  SaveStatus,
  SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE,
} from './contexts';
import { SettingsEditorActionEnums } from './actions';

export const settingsEditorReducer = handleActions<ISettingsEditorStateContext, any>(
  {
    [SettingsEditorActionEnums.FetchConfigurations]: (state: ISettingsEditorStateContext) => {
      return {
        ...state,
        configsLoadingState: 'loading',
      };
    },
    [SettingsEditorActionEnums.FetchConfigurationsSuccess]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<IFetchConfigurationsSuccessPayload>) => {
      const { payload } = action;
      return {
        ...state,
        configsLoadingState: 'success',
        settingConfigurations: payload.settingConfigurations,
      };
    },
    [SettingsEditorActionEnums.FetchConfigurationsError]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<IFetchConfigurationsErrorPayload>) => {
      return {
        ...state,
        configsLoadingState: 'failed',
        loadingConfigsError: action.payload,
      };
    },

    [SettingsEditorActionEnums.FetchApplications]: (state: ISettingsEditorStateContext) => {
      return {
        ...state,
        applicationsLoadingState: 'loading',
      };
    },
    [SettingsEditorActionEnums.FetchApplicationsSuccess]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<IFetchApplicationsSuccessPayload>) => {
      const { payload } = action;
      return {
        ...state,
        applicationsLoadingState: 'success',
        applications: payload.applications,
      };
    },
    [SettingsEditorActionEnums.FetchApplicationsError]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<IFetchApplicationsErrorPayload>) => {
      return {
        ...state,
        applicationsLoadingState: 'failed',
        loadingApplicationsError: action.payload,
      };
    },
    [SettingsEditorActionEnums.SelectApplication]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<ISettingSelection>) => {
      const { payload } = action;
      return {
        ...state,
        selectedApplication: payload.app,
        settingSelection: null,
        editorBridge: null,
        saveStatus: 'none',
      };
    },
    [SettingsEditorActionEnums.SelectSetting]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<ISettingSelection>) => {
      const { payload } = action;
      return {
        ...state,
        settingSelection: payload,
        editorBridge: null,
        saveStatus: 'none',
      };
    },
    [SettingsEditorActionEnums.SetEditorMode]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<FormMode>) => {
      const { payload } = action;
      return {
        ...state,
        editorMode: payload,
      };
    },
    [SettingsEditorActionEnums.SetEditorBridge]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<IEditorBridge>) => {
      const { payload } = action;
      return {
        ...state,
        editorBridge: payload,
      };
    },
    [SettingsEditorActionEnums.setSaveStatus]: (state: ISettingsEditorStateContext, action: ReduxActions.Action<SaveStatus>) => {
      const { payload } = action;
      return {
        ...state,
        saveStatus: payload,
      };
    },
  },

  SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE,
);
