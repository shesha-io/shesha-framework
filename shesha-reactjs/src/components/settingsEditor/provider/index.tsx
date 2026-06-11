import { UpdateSettingValueInput } from '@/apis/settings';
import useThunkReducer from '@/hooks/thunkReducer';
import { GetAllResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import { useHttpClient, useTheme } from '@/providers';
import React, { FC, PropsWithChildren, useContext, useEffect } from 'react';
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
import { extractAjaxResponse, IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { makeErrorWithMessage, throwError } from '@/utils/errors';
import { buildUrl } from '@/utils';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { useEffectOnce } from '@/hooks/useEffectOnce';

const getListFetcherQueryParams = (maxResultCount: number | undefined): IGenericGetAllPayload => {
  return {
    skipCount: 0,
    maxResultCount: maxResultCount ?? -1,
    entityType: 'Shesha.Domain.SettingConfiguration',
    properties:
      'id category dataType editorFormModule editorFormName isClientSpecific name, module { id name }, label, description',
    quickSearch: undefined,
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
  const httpClient = useHttpClient();
  const [state, dispatch] = useThunkReducer(settingsEditorReducer, initial);

  const { resetToApplicationTheme } = useTheme();
  useEffect(() => {
    resetToApplicationTheme();
    // TODO V1: review dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.applications, state.settingSelection]);

  const fetchConfigurations = (): void => {
    dispatch(fetchConfigurationsAction());

    const url = buildUrl<IGenericGetAllPayload>(`${GENERIC_ENTITIES_ENDPOINT}/GetAll`, getListFetcherQueryParams(1000));
    httpClient.get<IAjaxResponse<GetAllResponse<SettingConfigurationDto>>>(url)
      .then((response) => {
        const responseData = extractAjaxResponse(response.data);
        const settingConfigurations = responseData.items.map<ISettingConfiguration>((item) => {
          return {
            id: item.id,
            name: item.name,
            dataType: item.dataType,
            label: item.label,
            description: item.description,
            category: item.category,
            module: item.module?.name,
            editorForm: item.editorFormName && !isNullOrWhiteSpace(item.editorFormName) && !isNullOrWhiteSpace(item.editorFormModule)
              ? { name: item.editorFormName, module: item.editorFormModule }
              : undefined,
            isClientSpecific: item.isClientSpecific,
          } satisfies ISettingConfiguration;
        });

        dispatch(fetchConfigurationsSuccessAction({ settingConfigurations }));
      })
      .catch((error) => {
        dispatch(fetchConfigurationsErrorAction({ error: makeErrorWithMessage(error, "Failed to fetch configurations") }));
      });

    // fetch applications
    const appsUrl = buildUrl<IGenericGetAllPayload>(`${GENERIC_ENTITIES_ENDPOINT}/GetAll`, {
      skipCount: 0,
      maxResultCount: -1,
      entityType: 'Shesha.Domain.FrontEndApp',
      properties: 'id name appKey description',
      quickSearch: undefined,
      sorting: '',
    });
    httpClient.get<IAjaxResponse<GetAllResponse<FrontEndApplicationDto>>>(appsUrl)
      .then((response) => {
        const responseData = extractAjaxResponse(response.data);
        dispatch(fetchApplicationsSuccessAction({ applications: responseData.items }));
      })
      .catch((error) => {
        dispatch(fetchApplicationsErrorAction({ error: makeErrorWithMessage(error, "Failed to fetch applications") }));
      });
  };

  useEffectOnce(() => {
    fetchConfigurations();
  });

  const selectSetting = (setting: ISettingConfiguration, app: IFrontEndApplication | undefined): void => {
    state.editorBridge?.cancel();
    dispatch(selectSettingAction({ setting, app }));
    dispatch(setEditorModeAction('edit'));
  };

  const selectApplication = (app: IFrontEndApplication | undefined): void => {
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
    state.editorBridge?.cancel();
    dispatch(setSaveStatusAction('canceled'));
  };

  const fetchSettingValue = (settingId: ISettingIdentifier): Promise<SettingValue> => {
    const url = buildUrl(`/api/services/app/Settings/GetValue`, { name: settingId.name, module: settingId.module, appKey: settingId.appKey });
    return httpClient.get<IAjaxResponse<GetAllResponse<SettingConfigurationDto>>>(url)
      .then((response) => {
        return isAjaxSuccessResponse(response.data)
          ? response.data.result
          : undefined;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const saveSettingValue = (settingId: ISettingIdentifier, value: SettingValue): Promise<void> => {
    dispatch(setSaveStatusAction('saving'));
    return httpClient.post<IAjaxResponse<void>, UpdateSettingValueInput>(`/api/services/app/Settings/UpdateValue`, {
      name: settingId.name,
      module: settingId.module ?? null,
      appKey: settingId.appKey ?? null,
      value: value,
    })
      .then((response) => {
        extractAjaxResponse(response.data);
        dispatch(setSaveStatusAction('success'));
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

const useSettingsEditorOrUndefined = (): ISettingsEditorContext | undefined => useContext(SettingsEditorContext);

const useSettingsEditor = (): ISettingsEditorContext => useSettingsEditorOrUndefined() ?? throwError("useSettingsEditor must be used within a SettingsEditorContext");

export { SettingsEditorProvider, useSettingsEditorOrUndefined, useSettingsEditor };
