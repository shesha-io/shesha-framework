import { useSheshaApplication } from '@/providers/sheshaApplication';
import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { settingsGetValue } from '@/apis/settings';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { ISettingsActionsContext, ISettingsContext, SettingsContext } from './contexts';
import { ISettingIdentifier, ISettingsDictionary } from './models';

const SettingsProvider: FC<PropsWithChildren> = ({ children }) => {
  const settings = useRef<ISettingsDictionary>({});

  const { backendUrl, httpHeaders } = useSheshaApplication();

  const makeFormLoadingKey = (payload: ISettingIdentifier): string => {
    const { module, name } = payload;
    return `${module}:${name}`.toLowerCase();
  };

  const getSetting = (settingId: ISettingIdentifier): Promise<any> => {
    if (!settingId || !settingId.name) return Promise.reject('settingId is not specified');

    // create a key
    const key = makeFormLoadingKey(settingId);

    const loadedValue = settings.current[key];
    if (loadedValue) return loadedValue; // TODO: check for rejection

    const settingPromise = settingsGetValue(
      { name: settingId.name, module: settingId.module },
      { base: backendUrl, headers: httpHeaders },
    ).then((response) => {
      return response.success ? response.result : null;
    });

    settings.current[key] = settingPromise;

    return settingPromise;
  };

  const contextValue: ISettingsContext = {
    getSetting,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};


function useSettingsOrUndefined(): ISettingsActionsContext | undefined {
  return useContext(SettingsContext);
}

function useSettings(): ISettingsActionsContext {
  const context = useSettingsOrUndefined();
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}

export type LoadingState = 'waiting' | 'loading' | 'ready' | 'failed';

export interface SettingValueLoadingState<TValue = any> {
  loadingState: LoadingState;
  value?: TValue;
  error?: IErrorInfo;
}

const useSettingValue = <TValue = any>(settingId: ISettingIdentifier): SettingValueLoadingState<TValue> => {
  const settings = useSettings();
  const [state, setState] = useState<SettingValueLoadingState>({ loadingState: 'waiting' });

  useEffect(() => {
    settings.getSetting(settingId).then((response) => {
      setState((prev) => ({ ...prev, error: null, value: response as TValue, loadingState: 'ready' }));
    });
  }, [settingId?.module, settingId?.name]);

  return state;
};

export { SettingsProvider, useSettingValue, useSettings, useSettingsOrUndefined };
