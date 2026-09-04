"use client";

import { FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { ISettingsClientContext, SettingChangeListener, SettingsClientContext } from './contexts';
import { ISettingIdentifier, ISettingsDictionary } from './models';
import { throwError } from '@/utils/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { HttpClientApi, useHttpClient } from '../sheshaApplication/publicApi';
import { buildUrl } from '@/utils';
import { extractAjaxResponse, IAjaxResponse } from '@/interfaces';
import { UpdateSettingValueInput } from './api-models';
import { getLocalStorage } from '@/utils/storage';

const SETTINGS_URLS = {
  GET_VALUE: "/api/services/app/Settings/GetValue",
  SET_VALAUE: "/api/services/app/Settings/UpdateValue",
};

/** localStorage key used to propagate setting invalidations to other browser tabs */
export const SETTINGS_INVALIDATION_STORAGE_KEY = 'shesha:settings:invalidated';

const INVALIDATION_MESSAGE_SEPARATOR = '/';
const INVALIDATION_MESSAGE_PARTS = 3;

let invalidationCounter = 0;

/**
 * Encodes the setting identifier into the value written to localStorage.
 * A unique suffix (timestamp + counter) is appended so that repeated invalidations of the same setting,
 * even within the same millisecond, still fire the `storage` event.
 */
const encodeInvalidationMessage = (settingId: ISettingIdentifier): string => {
  invalidationCounter += 1;
  return [
    encodeURIComponent(settingId.module),
    encodeURIComponent(settingId.name),
    `${Date.now()}-${invalidationCounter}`,
  ].join(INVALIDATION_MESSAGE_SEPARATOR);
};

/**
 * Decodes the message written by `encodeInvalidationMessage`. Module-less settings have an empty module.
 */
const decodeInvalidationMessage = (message: string): ISettingIdentifier | undefined => {
  const parts = message.split(INVALIDATION_MESSAGE_SEPARATOR);
  if (parts.length !== INVALIDATION_MESSAGE_PARTS) return undefined;

  const [module = '', name = ''] = parts;
  if (isNullOrWhiteSpace(name)) return undefined;

  return { module: decodeURIComponent(module), name: decodeURIComponent(name) };
};

class SettingsClient implements ISettingsClientContext {
  #httpClient: HttpClientApi;

  #settings: ISettingsDictionary;

  #listeners: Map<string, Set<SettingChangeListener>>;

  constructor(httpClient: HttpClientApi) {
    this.#settings = {};
    this.#listeners = new Map();
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

    this.invalidateSetting(settingId);
  };

  getSetting = <TValue = unknown>(settingId: ISettingIdentifier): Promise<TValue> => {
    if (!isDefined(settingId) || isNullOrWhiteSpace(settingId.name)) return Promise.reject('settingId is not specified');

    // create a key
    const key = this.makeFormLoadingKey(settingId);

    const loadedValue = this.#settings[key];
    if (loadedValue) return loadedValue as Promise<TValue>;

    const url = buildUrl(SETTINGS_URLS.GET_VALUE, { name: settingId.name, module: settingId.module });
    const settingPromise = this.#httpClient.get<IAjaxResponse<TValue>>(url).then((response) => {
      return extractAjaxResponse(response.data);
    });

    this.#settings[key] = settingPromise;

    // don't keep failed requests in the cache, otherwise a transient error would stick for the whole session
    settingPromise.catch(() => {
      if (this.#settings[key] === settingPromise)
        delete this.#settings[key];
    });

    return settingPromise;
  };

  invalidateSetting = (settingId: ISettingIdentifier): void => {
    this.#invalidateLocal(settingId);
    this.#broadcastInvalidation(settingId);
  };

  subscribe = (settingId: ISettingIdentifier, listener: SettingChangeListener): (() => void) => {
    const key = this.makeFormLoadingKey(settingId);
    let listeners = this.#listeners.get(key);
    if (!listeners) {
      listeners = new Set();
      this.#listeners.set(key, listeners);
    }
    listeners.add(listener);

    return () => {
      const current = this.#listeners.get(key);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0)
        this.#listeners.delete(key);
    };
  };

  /**
   * Handles `storage` events fired when another tab invalidates a setting
   */
  handleStorageEvent = (e: StorageEvent): void => {
    if (e.key !== SETTINGS_INVALIDATION_STORAGE_KEY || isNullOrWhiteSpace(e.newValue)) return;

    const settingId = decodeInvalidationMessage(e.newValue);
    if (!settingId) return;

    this.#invalidateLocal(settingId);
  };

  #invalidateLocal = (settingId: ISettingIdentifier): void => {
    const key = this.makeFormLoadingKey(settingId);
    delete this.#settings[key];

    const listeners = this.#listeners.get(key);
    if (!listeners) return;
    // copy to allow listeners to unsubscribe while iterating
    [...listeners].forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Setting change listener failed', err);
      }
    });
  };

  #broadcastInvalidation = (settingId: ISettingIdentifier): void => {
    try {
      getLocalStorage()?.setItem(SETTINGS_INVALIDATION_STORAGE_KEY, encodeInvalidationMessage(settingId));
    } catch (err) {
      console.error('Failed to broadcast setting invalidation', err);
    }
  };

  makeFormLoadingKey = (payload: ISettingIdentifier): string => {
    const { module, name } = payload;
    return `${module}:${name}`.toLowerCase();
  };
};

const SettingsProvider: FC<PropsWithChildren> = ({ children }) => {
  const httpClient = useHttpClient();
  const [settingsClient] = useState<SettingsClient>(() => {
    return new SettingsClient(httpClient);
  });

  // cross-tab propagation of setting invalidations
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    window.addEventListener('storage', settingsClient.handleStorageEvent);
    return () => {
      window.removeEventListener('storage', settingsClient.handleStorageEvent);
    };
  }, [settingsClient]);

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

/**
 * Loads the value of the specified setting and keeps it up to date:
 * the value is re-fetched whenever the setting is invalidated (e.g. saved in the settings editor,
 * in this tab or in another tab of the same origin).
 * The previous value is kept while the new one is loading.
 */
interface SettingValueInternalState<TValue> {
  settingId: ISettingIdentifier;
  status: 'waiting' | 'ready' | 'failed';
  /** version of the setting the state corresponds to, see `version` in the hook */
  version: number;
  value?: TValue | undefined;
  error?: IErrorInfo | undefined;
}

const useSettingValue = <TValue = unknown>(settingId: ISettingIdentifier): SettingValueLoadingState<TValue> => {
  const settings = useSettings();
  const { module, name } = settingId;
  const [state, setState] = useState<SettingValueInternalState<TValue>>({ settingId, status: 'waiting', version: -1 });
  // incremented on every invalidation of the setting to trigger re-fetch
  const [version, setVersion] = useState(0);

  useEffect(() => {
    return settings.subscribe({ module, name }, () => {
      setVersion((prev) => prev + 1);
    });
  }, [settings, module, name]);

  useEffect(() => {
    let active = true;
    const id: ISettingIdentifier = { module, name };

    settings.getSetting<TValue>(id)
      .then((response) => {
        if (!active) return;
        setState({ settingId: id, status: 'ready', version, value: response, error: undefined });
      })
      .catch((error) => {
        console.error('Failed to fetch setting value', error);
        if (!active) return;
        setState((prev) => ({ ...prev, settingId: id, status: 'failed', version }));
      });

    return () => {
      active = false;
    };
  }, [settings, module, name, version]);

  return useMemo<SettingValueLoadingState<TValue>>(() => {
    const isCurrent = state.version === version && state.settingId.module === module && state.settingId.name === name;
    const loadingState: LoadingState = isCurrent
      ? state.status
      : state.status === 'waiting' ? 'waiting' : 'loading';

    // note: the previous value is kept while a new one is loading
    return {
      settingId: state.settingId,
      loadingState,
      value: state.value,
      error: state.error,
    };
  }, [state, version, module, name]);
};

export { SettingsProvider, useSettingValue, useSettings, useSettingsOrUndefined };
