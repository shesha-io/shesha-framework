import { settingsGetValue, settingsUpdateValue } from '@/apis/settings';
import useThunkReducer from '@/hooks/thunkReducer';
import { IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import { useSheshaApplication, useTheme } from '@/providers';
import React, { FC, PropsWithChildren, useContext, useEffect } from 'react';
import * as RestfulShesha from '@/utils/fetchers';
import { GENERIC_ENTITIES_ENDPOINT } from '@/shesha-constants';
import {
  fetchApplicationsErrorAction,
  fetchApplicationsSuccessAction,
  fetchConfigurationsAction,
  fetchConfigurationsErrorAction,
  fetchConfigurationsSuccessAction,
  selectApplicationAction,
  selectSettingAction,
  setEditorBridgeAction,
  setEditorModeAction,
  setSaveStatusAction,
} from './actions';
import {
  IEditorBridge,
  ISettingsEditorContext,
  ISettingsEditorStateContext,
  SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE,
  SettingsEditorContext,
} from './contexts';
import {
  FrontEndApplicationDto,
  IFrontEndApplication,
  ISettingConfiguration,
  ISettingIdentifier,
  SettingValue,
} from './models';
import { settingsEditorReducer } from './reducer';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';

const getListFetcherQueryParams = (maxResultCount): IGenericGetAllPayload => {
  return {
    skipCount: 0,
    maxResultCount: maxResultCount ?? -1,
    entityType: 'Shesha.Domain.SettingConfiguration',
    properties:
      'id category dataType editorFormModule editorFormName isClientSpecific name, module { id name }, label, description',
    quickSearch: null,
    sorting: 'module.name, name',
  };
};
interface SettingConfigurationDto {
  id: string;
  category?: string;
  dataType: string;
  editorFormModule?: string;
  editorFormName?: string;
  isClientSpecific: boolean;
  name: string;
  label?: string;
  description?: string;
  module?: {
    id: string;
    name: string;
  };
}

const SettingsEditorProvider: FC<PropsWithChildren> = ({ children }) => {
  const initial: ISettingsEditorStateContext = {
    ...SETTINGS_EDITOR_STATE_CONTEXT_INITIAL_STATE,
  };
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [state, dispatch] = useThunkReducer(settingsEditorReducer, initial);

  const { resetToApplicationTheme } = useTheme();
  useEffect(() => {
    resetToApplicationTheme();
  }, [state.applications, state.settingSelection]);

  const fetchConfigurations = (): void => {
    dispatch(fetchConfigurationsAction());

    // fetch configurations
    RestfulShesha.get<IAbpWrappedGetEntityListResponse<SettingConfigurationDto>, any, IGenericGetAllPayload, any>(
      `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
      getListFetcherQueryParams(1000),
      { base: backendUrl, headers: httpHeaders },
    )
      .then((response) => {
        if (response.success) {
          const settingConfigurations = response.result.items.map<ISettingConfiguration>((item) => {
            return {
              id: item.id,
              name: item.name,
              dataType: item.dataType,
              label: item.label,
              description: item.description,
              category: item.category,
              module: item.module?.name,
              editorForm: item.editorFormName ? { name: item.editorFormName, module: item.editorFormModule } : null,
              isClientSpecific: item.isClientSpecific,
            };
          });

          dispatch(fetchConfigurationsSuccessAction({ settingConfigurations }));
        } else dispatch(fetchConfigurationsErrorAction({ error: response.error }));
      })
      .catch((error) => {
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
      { base: backendUrl, headers: httpHeaders },
    )
      .then((response) => {
        if (response.success) {
          const frontEndApps: FrontEndApplicationDto[] = [...response.result.items];
          dispatch(fetchApplicationsSuccessAction({ applications: frontEndApps }));
        } else dispatch(fetchApplicationsErrorAction({ error: response.error }));
      })
      .catch((error) => {
        dispatch(fetchApplicationsErrorAction({ error }));
      });
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const selectSetting = (setting: ISettingConfiguration, app: IFrontEndApplication): void => {
    state.editorBridge?.cancel();
    dispatch(selectSettingAction({ setting, app }));
    dispatch(setEditorModeAction('edit'));
  };

  const selectApplication = (app: IFrontEndApplication): void => {
    dispatch(selectApplicationAction({ app }));
  };

  const saveSetting = (): Promise<void> => {
    if (!state.editorBridge) return Promise.reject('Setting editor not available');

    dispatch(setSaveStatusAction('saving'));
    return state.editorBridge.save().then(() => {
      dispatch(setSaveStatusAction('success'));
    }).catch(() => {
      dispatch(setSaveStatusAction('error'));
    });
  };
  const startEditSetting = (): void => {
    dispatch(setSaveStatusAction('none'));
    dispatch(setEditorModeAction('edit'));
  };
  const cancelEditSetting = (): void => {
    state.editorBridge.cancel();
    dispatch(setSaveStatusAction('canceled'));
  };

  const fetchSettingValue = (settingId: ISettingIdentifier): Promise<SettingValue> => {
    return settingsGetValue(
      { name: settingId.name, module: settingId.module, appKey: settingId.appKey },
      { base: backendUrl, headers: httpHeaders },
    )
      .then((response) => {
        return isAjaxSuccessResponse(response)
          ? response.result
          : undefined;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const saveSettingValue = (settingId: ISettingIdentifier, value: SettingValue): Promise<void> => {
    dispatch(setSaveStatusAction('saving'));
    return settingsUpdateValue(
      {
        name: settingId.name,
        module: settingId.module,
        appKey: settingId.appKey,
        value: value,
      },
      { base: backendUrl, headers: httpHeaders },
    )
      .then((response) => {
        dispatch(setSaveStatusAction('success'));
        return response;
      })
      .catch((error) => {
        dispatch(setSaveStatusAction('error'));
        console.error(error);
      });
  };

  const setEditor = (editorBridge: IEditorBridge): void => {
    dispatch(setEditorBridgeAction(editorBridge));
  };

  const contextValue: ISettingsEditorContext = {
    ...state,
    selectApplication,
    selectSetting,
    saveSetting,
    startEditSetting,
    cancelEditSetting,

    fetchSettingValue,
    saveSettingValue,
    setEditor,
  };

  return <SettingsEditorContext.Provider value={contextValue}>{children}</SettingsEditorContext.Provider>;
};

function useSettingsEditor(require: boolean = true): ISettingsEditorContext | undefined {
  const context = useContext(SettingsEditorContext);

  if (require && context === undefined) {
    throw new Error('useSettingsEditor must be used within a SettingsEditorContext');
  }

  return context;
}

export { SettingsEditorProvider, useSettingsEditor };
