import { FormMode } from '@/providers';
import { FrontEndApplicationDto, IFrontEndApplication, ISettingConfiguration, ISettingIdentifier, LoadingState, SettingValue } from './models';
import { createNamedContext } from '@/utils/react';

export interface IEditorBridge {
  save: () => Promise<void>;
  cancel: () => void;
  // startEdit: () => void,
}

export type SaveStatus = 'none' | 'saving' | 'success' | 'error' | 'canceled';

export interface ISettingsEditorStateContext {
  configsLoadingState: LoadingState;
  loadingConfigsError?: any;
  settingConfigurations: ISettingConfiguration[];

  applicationsLoadingState: LoadingState;
  loadingApplicationsError?: any;
  applications: IFrontEndApplication[];

  settingSelection: ISettingSelection;

  editorMode: FormMode;
  editorBridge?: IEditorBridge;

  selectedApplication?: IFrontEndApplication;

  saveStatus?: SaveStatus;
}

export interface ISettingsEditorActionsContext {
  selectApplication: (app?: IFrontEndApplication) => void;
  selectSetting: (setting: ISettingConfiguration, app?: IFrontEndApplication) => void;

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
  error: any;
}

export interface IFetchApplicationsSuccessPayload {
  applications: FrontEndApplicationDto[];
}
export interface IFetchApplicationsErrorPayload {
  error: any;
}

export interface ISettingSelection {
  setting?: ISettingConfiguration;
  app?: IFrontEndApplication;
}


/** initial state */
export const SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE: ISettingsEditorStateContext = {
  configsLoadingState: 'waiting',
  settingConfigurations: [],

  applicationsLoadingState: 'waiting',
  applications: [],

  settingSelection: null,
  editorMode: 'edit',
};

export const SettingsEditorContext = createNamedContext<ISettingsEditorContext>(undefined, "SettingsEditorContext");
