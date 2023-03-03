import React, { useContext, useEffect } from 'react';
import { FC } from 'react';
import useThunkReducer from 'react-hook-thunk-reducer';
import { IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '../../../interfaces/gql';
import { IEditorBridge, ISettingsEditorContext, ISettingsEditorStateContext, SettingsEditorContext, SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE } from './contexts';
import { settingsEditorReducer } from './reducer';
import { fetchApplicationsErrorAction, fetchApplicationsSuccessAction, fetchConfigurationsAction, fetchConfigurationsErrorAction, fetchConfigurationsSuccessAction, selectSettingAction, setEditorBridgeAction, setEditorModeAction } from './actions';
import * as RestfulShesha from '../../../utils/fetchers';
import { GENERIC_ENTITIES_ENDPOINT } from '../../../constants';
import { useSheshaApplication } from '../../..';
import { FrontEndApplicationDto, IFrontEndApplication, ISettingConfiguration, ISettingIdentifier, SettingValue } from './models';
import { settingsGetValue, settingsUpdateValue } from '../../../apis/settings';

export interface ISettingsEditorProviderProps {

}

const getListFetcherQueryParams = (maxResultCount): IGenericGetAllPayload => {
    return {
        skipCount: 0,
        maxResultCount: maxResultCount ?? -1,
        entityType: 'Shesha.Domain.SettingConfiguration',
        properties: 'id category dataType editorFormModule editorFormName isClientSpecific configuration { name, module { id name }, label, description, versionNo }',
        quickSearch: null,
        sorting: 'configuration.module.name, configuration.name',
    };
};
interface SettingConfigurationDto {
    id: string;
    category?: string;
    dataType: string;
    editorFormModule?: string;
    editorFormName?: string;
    isClientSpecific: boolean;
    configuration: {
        name: string;
        label?: string;
        description?: string;
        versionNo?: number;
        module?: {
            id: string;
            name: string;
        }
    }
}

const SettingsEditorProvider: FC<ISettingsEditorProviderProps> = ({ children }) => {
    const initial: ISettingsEditorStateContext = {
        ...SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE,
    };
    const { backendUrl, httpHeaders } = useSheshaApplication();

    const [state, dispatch] = useThunkReducer(settingsEditorReducer, initial);

    const fetchConfigurations = () => {
        dispatch(fetchConfigurationsAction());

        // fetch configurations
        RestfulShesha.get<IAbpWrappedGetEntityListResponse<SettingConfigurationDto>, any, IGenericGetAllPayload, any>(
            `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
            getListFetcherQueryParams(1000),
            { base: backendUrl, headers: httpHeaders }
        ).then(response => {
            if (response.success) {
                const settingConfigurations = response.result.items.map<ISettingConfiguration>(item => {
                    return {
                        id: item.id,
                        name: item.configuration.name,
                        dataType: item.dataType,
                        label: item.configuration.label,
                        description: item.configuration.description,
                        category: item.category,
                        module: item.configuration.module?.name,
                        editorForm: item.editorFormName ? { name: item.editorFormName, module: item.editorFormModule } : null,
                        isClientSpecific: item.isClientSpecific,
                    };
                });

                dispatch(fetchConfigurationsSuccessAction({ settingConfigurations }));
            } else
                dispatch(fetchConfigurationsErrorAction({ error: response.error }));
        }).catch(error => {
            dispatch(fetchConfigurationsErrorAction({ error }));
        });

        // fetch applications
        RestfulShesha.get<IAbpWrappedGetEntityListResponse<FrontEndApplicationDto>, any, IGenericGetAllPayload, any>(
            `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
            {
                skipCount: 0,
                maxResultCount: -1,
                entityType: 'Shesha.Domain.FrontEndApp',
                properties: 'id name appKey description',
                quickSearch: null,
                sorting: '',
            },
            { base: backendUrl, headers: httpHeaders }
        ).then(response => {
            if (response.success) {
                dispatch(fetchApplicationsSuccessAction({ applications: response.result.items }));
            } else
                dispatch(fetchApplicationsErrorAction({ error: response.error }));
        }).catch(error => {
            dispatch(fetchApplicationsErrorAction({ error }));
        });
    }

    useEffect(() => {
        fetchConfigurations();
    }, []);

    const selectSetting = (setting: ISettingConfiguration, app: IFrontEndApplication) => {
        dispatch(selectSettingAction({ setting, app }));
    }

    const saveSetting = () => {
        if (!state.editorBridge)
            return Promise.reject('Setting editor not available');

        return state.editorBridge.save();
    }
    const startEditSetting = () => {
        dispatch(setEditorModeAction('edit'));
    }
    const cancelEditSetting = () => {
        dispatch(setEditorModeAction('readonly'));
    }

    const fetchSettingValue = (settingId: ISettingIdentifier) => {
        return settingsGetValue({ name: settingId.name, module: settingId.module, appKey: settingId.appKey }, { base: backendUrl, headers: httpHeaders }).then(response => {
            return response.result;
        }).catch(error => {
            console.error(error);
        });
    }

    const saveSettingValue = (settingId: ISettingIdentifier, value: SettingValue) => {
        return settingsUpdateValue({
            name: settingId.name,
            module: settingId.module,
            appKey: settingId.appKey,
            value: value,
        }, { base: backendUrl, headers: httpHeaders }).then(response => {
            return response;
        }).catch(error => {
            console.error(error);
        });
    }

    const setEditor = (editorBridge: IEditorBridge) => {
        dispatch(setEditorBridgeAction(editorBridge));
    }

    const contextValue: ISettingsEditorContext = {
        ...state,
        selectSetting,
        saveSetting,
        startEditSetting,
        cancelEditSetting,

        fetchSettingValue,
        saveSettingValue,
        setEditor,
    };

    return <SettingsEditorContext.Provider value={contextValue}>{children}</SettingsEditorContext.Provider>;
}

function useSettingsEditor(require: boolean = true) {
    const context = useContext(SettingsEditorContext);

    if (require && context === undefined) {
        throw new Error('useSettingsEditor must be used within a SettingsEditorContext');
    }

    return context;
}

export { SettingsEditorProvider, useSettingsEditor };