import { createContext } from 'react';
import { FormMode } from '../../../providers';
import { FrontEndApplicationDto, IFrontEndApplication, ISettingConfiguration, ISettingIdentifier, LoadingState, SettingValue } from './models';

export interface IEditorBridge {
    save: () => Promise<void>;
    //startEdit: () => void,
}

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
}

export interface ISettingsEditorActionsContext {
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
    setting: ISettingConfiguration;
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

export const SettingsEditorContext = createContext<ISettingsEditorContext>(undefined);