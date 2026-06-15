import { createAction } from '@reduxjs/toolkit';
import { FormMode } from '@/interfaces';
import {
  IEditorBridge,
  IFetchApplicationsErrorPayload,
  IFetchApplicationsSuccessPayload,
  IFetchConfigurationsErrorPayload,
  IFetchConfigurationsSuccessPayload,
  ISettingSelection,
  SaveStatus,
} from './contexts';

export enum SettingsEditorActionEnums {
  /* NEW_ACTION_TYPE_GOES_HERE */
  FetchConfigurations = 'FETCH_CONFIGURATIONS',
  FetchConfigurationsSuccess = 'FETCH_CONFIGURATIONS_SUCCEESS',
  FetchConfigurationsError = 'FETCH_CONFIGURATIONS_ERROR',
  FetchApplications = 'FETCH_APPLICATIONS',
  FetchApplicationsSuccess = 'FETCH_APPLICATIONS_SUCCESS',
  FetchApplicationsError = 'FETCH_APPLICATIONS_ERROR',
  SelectSetting = 'SELECT_SETTING',
  SelectApplication = 'SELECT_APPLICATION',
  SetEditorMode = 'SET_EDITOR_MODE',
  SetEditorBridge = 'SET_EDITOR_BRIDGE',
  setSaveStatus = 'SET_SAVE_STATUS',
}

/* NEW_ACTION_GOES_HERE */
export const fetchConfigurationsAction = createAction<void>(SettingsEditorActionEnums.FetchConfigurations);
export const fetchConfigurationsSuccessAction = createAction<IFetchConfigurationsSuccessPayload>(SettingsEditorActionEnums.FetchConfigurationsSuccess);
export const fetchConfigurationsErrorAction = createAction<IFetchConfigurationsErrorPayload>(SettingsEditorActionEnums.FetchConfigurationsError);

export const fetchApplicationsAction = createAction<void>(SettingsEditorActionEnums.FetchApplications);
export const fetchApplicationsSuccessAction = createAction<IFetchApplicationsSuccessPayload>(SettingsEditorActionEnums.FetchApplicationsSuccess);
export const fetchApplicationsErrorAction = createAction<IFetchApplicationsErrorPayload>(SettingsEditorActionEnums.FetchApplicationsError);

export const selectSettingAction = createAction<ISettingSelection>(SettingsEditorActionEnums.SelectSetting);

export const selectApplicationAction = createAction<ISettingSelection>(SettingsEditorActionEnums.SelectApplication);

export const setEditorModeAction = createAction<FormMode>(SettingsEditorActionEnums.SetEditorMode);

export const setEditorBridgeAction = createAction<IEditorBridge>(SettingsEditorActionEnums.SetEditorBridge);

export const setSaveStatusAction = createAction<SaveStatus>(SettingsEditorActionEnums.setSaveStatus);
