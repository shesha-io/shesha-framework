"use client";

import React, { FC, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { ISettingsClientContext, SettingsClientContext } from './contexts';
import { ISettingIdentifier, ISettingsDictionary } from './models';
import { throwError } from '@/utils/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { HttpClientApi, useHttpClient } from '../sheshaApplication/publicApi';
import { buildUrl } from '@/utils';
import { extractAjaxResponse, IAjaxResponse } from '@/interfaces';
import { settingIdentifiersEqual } from '@/utils/settings';
import { UpdateSettingValueInput } from './api-models';

const SETTINGS_URLS = {
  GET_VALUE: "/api/services/app/Settings/GetValue",
  SET_VALAUE: "/api/services/app/Settings/UpdateValue",
};

class SettingsClient implements ISettingsClientContext {
  #httpClient: HttpClientApi;

  #settings: ISettingsDictionary;

  constructor(httpClient: HttpClientApi) {
    this.#settings = {};
    this.#httpClient = httpClient;
  }

  setSetting = async <TValue = unknown>(settingId: ISettingIdentifier, value: TValue, applicationKey?: string): Promise<void> => {
    if (!isDefined(settingId) || isNullOrWhiteSpace(settingId.name)) return Promise.reject('settingId is not specified');

    const payload: UpdateSettingValueInput = {
      name: settingId.name,
      module: settingId.module,
      appKey: applicationKey,
      value: value,
    };
    const response = await this.#httpClient.post<IAjaxResponse<void>>(SETTINGS_URLS.SET_VALAUE, payload);
    extractAjaxResponse(response.data);
  };

  getSetting = <TValue = unknown>(settingId: ISettingIdentifier): Promise<TValue> => {
    if (!isDefined(settingId) || isNullOrWhiteSpace(settingId.name)) return Promise.reject('settingId is not specified');

    // create a key
    const key = this.makeFormLoadingKey(settingId);

    const loadedValue = this.#settings[key];
    if (loadedValue) return loadedValue as Promise<TValue>; // TODO: check for rejection

    const url = buildUrl(SETTINGS_URLS.GET_VALUE, { name: settingId.name, module: settingId.module });
    const settingPromise = this.#httpClient.get<IAjaxResponse<TValue>>(url).then((response) => {
      return extractAjaxResponse(response.data);
    });

    this.#settings[key] = settingPromise;

    return settingPromise;
  };

  makeFormLoadingKey = (payload: ISettingIdentifier): string => {
    const { module, name } = payload;
    return `${module}:${name}`.toLowerCase();
  };
};

const SettingsProvider: FC<PropsWithChildren> = ({ children }) => {
  const httpClient = useHttpClient();
  const [settingsClient] = useState<ISettingsClientContext>(() => {
    return new SettingsClient(httpClient);
  });

  return <SettingsClientContext.Provider value={settingsClient}>{children}</SettingsClientContext.Provider>;
};


const useSettingsOrUndefined = (): ISettingsClientContext | undefined => useContext(SettingsClientContext);

const useSettings = (): ISettingsClientContext => useSettingsOrUndefined() ?? throwError('useSettings must be used within a SettingsProvider');

export type LoadingState = 'waiting' | 'loading' | 'ready' | 'failed';

export interface SettingValueLoadingState<TValue = unknown> {
  settingId: ISettingIdentifier;
  loadingState: LoadingState;
  value?: TValue | undefined;
  error?: IErrorInfo | undefined;
}

const useSettingValue = <TValue = unknown>(settingId: ISettingIdentifier): SettingValueLoadingState<TValue> => {
  const settings = useSettings();
  const [state, setState] = useState<SettingValueLoadingState<TValue>>({ loadingState: 'waiting', settingId });

  useEffect(() => {
    if (settingIdentifiersEqual(state.settingId, settingId) && state.loadingState !== 'waiting')
      return;

    settings.getSetting<TValue>(settingId)
      .then((response) => {
        setState((prev) => ({ ...prev, error: undefined, value: response, loadingState: 'ready' }));
      })
      .catch((error) => {
        console.error('Failed to fetch setting value', error);
      });
  }, [settingId, settings, state.loadingState, state.settingId]);

  return state;
};

export { SettingsProvider, useSettingValue, useSettings, useSettingsOrUndefined };
