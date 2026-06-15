import { FormMode } from '@/providers';
import { FrontEndApplicationDto, IFrontEndApplication, ISettingConfiguration, ISettingIdentifier, LoadingState, SettingValue } from './models';
import { createNamedContext } from '@/utils/react';
import { IErrorInfo } from '@/interfaces';

export interface IEditorBridge {
  save: () => Promise<void>;
  cancel: () => void;
}

export type SaveStatus = 'none' | 'saving' | 'success' | 'error' | 'canceled';

export interface ISettingsEditorStateContext {
  configsLoadingState: LoadingState;
  loadingConfigsError?: IErrorInfo | undefined;
  settingConfigurations: ISettingConfiguration[];

  applicationsLoadingState: LoadingState;
  loadingApplicationsError?: IErrorInfo | undefined;
  applications: IFrontEndApplication[];

  settingSelection: ISettingSelection | undefined;

  editorMode: FormMode | undefined;
  editorBridge: IEditorBridge | undefined;

  selectedApplication: IFrontEndApplication | undefined;

  saveStatus: SaveStatus | undefined;
}

export interface ISettingsEditorActionsContext {
  selectApplication: (app?: IFrontEndApplication | undefined) => void;
  selectSetting: (setting: ISettingConfiguration, app?: IFrontEndApplication | undefined) => void;

  saveSetting: () => Promise<void>;
  startEditSetting: () => void;
  cancelEditSetting: () => void;

  fetchSettingValue: (settingId: ISettingIdentifier) => Promise<SettingValue>;
  saveSettingValue: (settingId: ISettingIdentifier, value: SettingValue) => Promise<void>;

  setEditor: (editorBridge: IEditorBridge) => void;
}

export interface ISettingsEditorContext extends ISettingsEditorStateContext, ISettingsEditorActionsContext {

}

export interface IFetchConfigurationsSuccessPayload {
  settingConfigurations: ISettingConfiguration[];
}
export interface IFetchConfigurationsErrorPayload {
  error: IErrorInfo;
}

export interface IFetchApplicationsSuccessPayload {
  applications: FrontEndApplicationDto[];
}
export interface IFetchApplicationsErrorPayload {
  error: IErrorInfo;
}

export interface ISettingSelection {
  setting?: ISettingConfiguration | undefined;
  app?: IFrontEndApplication | undefined;
}


/** initial state */
export const SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE: ISettingsEditorStateContext = {
  configsLoadingState: 'waiting',
  settingConfigurations: [],

  applicationsLoadingState: 'waiting',
  applications: [],

  settingSelection: undefined,
  editorMode: 'edit',
  editorBridge: undefined,
  selectedApplication: undefined,
  saveStatus: undefined,
};

export const SettingsEditorContext = createNamedContext<ISettingsEditorContext | undefined>(undefined, "SettingsEditorContext");
