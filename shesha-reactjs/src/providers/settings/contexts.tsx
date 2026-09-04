import { createNamedContext } from '@/utils/react';
import { ISettingIdentifier } from './models';

export interface ILoadSettingPayload {
  module: string;
  name: string;
}

export type SettingChangeListener = () => void;

export interface ISettingsClientContext {
  getSetting: <TValue = unknown>(settingId: ISettingIdentifier) => Promise<TValue>;
  setSetting: <TValue = unknown>(settingId: ISettingIdentifier, value: TValue, applicationKey?: string) => Promise<void>;
  /**
   * Drop the cached value of the setting (in this tab and, via the `storage` event, in other tabs of the same origin)
   * and notify subscribers so they re-fetch the value.
   */
  invalidateSetting: (settingId: ISettingIdentifier) => void;
  /**
   * Subscribe to invalidations of the specified setting. Returns an unsubscribe function.
   */
  subscribe: (settingId: ISettingIdentifier, listener: SettingChangeListener) => () => void;
}

export const SettingsClientContext = createNamedContext<ISettingsClientContext | undefined>(undefined, "SettingsClientContext");
