import {
  SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE,
} from './contexts';
import {
  fetchConfigurationsAction,
  fetchConfigurationsSuccessAction,
  fetchConfigurationsErrorAction,
  fetchApplicationsAction,
  fetchApplicationsSuccessAction,
  fetchApplicationsErrorAction,
  selectSettingAction,
  selectApplicationAction,
  setEditorModeAction,
  setEditorBridgeAction,
  setSaveStatusAction,
} from './actions';
import { createReducer } from '@reduxjs/toolkit';

export const settingsEditorReducer = createReducer(SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(fetchConfigurationsAction, (state) => {
      state.configsLoadingState = 'loading';
    })
    .addCase(fetchConfigurationsSuccessAction, (state, { payload }) => {
      return {
        ...state,
        configsLoadingState: 'success',
        settingConfigurations: payload.settingConfigurations,
      };
    })
    .addCase(fetchConfigurationsErrorAction, (state, { payload }) => {
      return {
        ...state,
        configsLoadingState: 'failed',
        loadingConfigsError: payload.error,
      };
    })

    .addCase(fetchApplicationsAction, (state) => {
      state.applicationsLoadingState = 'loading';
    })
    .addCase(fetchApplicationsSuccessAction, (state, { payload }) => {
      return {
        ...state,
        applicationsLoadingState: 'success',
        applications: payload.applications,
      };
    })
    .addCase(fetchApplicationsErrorAction, (state, { payload }) => {
      return {
        ...state,
        applicationsLoadingState: 'failed',
        loadingApplicationsError: payload.error,
      };
    })

    .addCase(selectApplicationAction, (state, { payload }) => {
      return {
        ...state,
        selectedApplication: payload.app,
        settingSelection: undefined,
        editorBridge: undefined,
        saveStatus: 'none',
      };
    })
    .addCase(selectSettingAction, (state, { payload }) => {
      return {
        ...state,
        settingSelection: payload,
        editorBridge: undefined,
        saveStatus: 'none',
      };
    })
    .addCase(setEditorModeAction, (state, { payload }) => {
      state.editorMode = payload;
    })
    .addCase(setEditorBridgeAction, (state, { payload }) => {
      state.editorBridge = payload;
    })
    .addCase(setSaveStatusAction, (state, { payload }) => {
      state.saveStatus = payload;
    })
  ;
});

