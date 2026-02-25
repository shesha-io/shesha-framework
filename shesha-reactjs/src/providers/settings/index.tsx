import { useSheshaApplication } from '@/providers';
import React, { FC, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { settingsGetValue } from '@/apis/settings';
import useThunkReducer from '@/hooks/thunkReducer';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { ISettingsContext, SETTINGS_CONTEXT_INITIAL_STATE, SettingsContext } from './contexts';
import { ISettingIdentifier, ISettingsDictionary } from './models';
import reducer from './reducer';

export interface ISettingsProviderProps {}

const SettingsProvider: FC<PropsWithChildren<ISettingsProviderProps>> = ({ children }) => {
  const [state] = useThunkReducer(reducer, SETTINGS_CONTEXT_INITIAL_STATE);
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
      { base: backendUrl, headers: httpHeaders }
    ).then((response) => {
      return response.success ? response.result : null;
    });

    settings.current[key] = settingPromise;

    return settingPromise;
  };

  const clearSetting = (settingId: ISettingIdentifier): void => {
    if (!settingId?.name) return;
    const key = makeFormLoadingKey(settingId);
    delete settings.current[key];
  };

  const contextValue: ISettingsContext = {
    ...state,
    getSetting,
    clearSetting,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

function useSettings(require: boolean = true) {
  const context = useContext(SettingsContext);

  if (context === undefined && require) {
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

const SETTING_CHANGED_EVENT = 'shesha:settingChanged';

const useSettingValue = <TValue = any,>(settingId: ISettingIdentifier): SettingValueLoadingState<TValue> => {
  const settings = useSettings();
  const [state, setState] = useState<SettingValueLoadingState>({ loadingState: 'waiting' });
  const [fetchCounter, setFetchCounter] = useState(0);

  // When a setting is saved elsewhere in the app (e.g. admin portal),
  // clear the cache and re-fetch so the caller reacts without a page refresh.
  const handleSettingChanged = useCallback(
    (e: Event) => {
      const saved = (e as CustomEvent<ISettingIdentifier>).detail;
      if (
        saved?.name?.toLowerCase() === settingId?.name?.toLowerCase() &&
        saved?.module?.toLowerCase() === settingId?.module?.toLowerCase()
      ) {
        settings.clearSetting(settingId);
        setFetchCounter((c) => c + 1);
      }
    },
    [settingId?.module, settingId?.name]
  );

  useEffect(() => {
    window.addEventListener(SETTING_CHANGED_EVENT, handleSettingChanged);
    return () => window.removeEventListener(SETTING_CHANGED_EVENT, handleSettingChanged);
  }, [handleSettingChanged]);

  useEffect(() => {
    settings.getSetting(settingId).then((response) => {
      setState((prev) => ({ ...prev, error: null, value: response as TValue, loadingState: 'ready' }));
    });
  }, [settingId?.module, settingId?.name, fetchCounter]);

  return state;
};

export { SettingsProvider, useSettingValue, useSettings };
