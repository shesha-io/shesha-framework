import { createNamedContext } from '@/utils/react';
import { ISettingIdentifier } from './models';

export interface ILoadSettingPayload {
  module: string;
  name: string;
}

export interface ISettingsClientContext {
  getSetting: <TValue = unknown>(settingId: ISettingIdentifier) => Promise<TValue>;
  setSetting: <TValue = unknown>(settingId: ISettingIdentifier, value: TValue, applicationKey?: string) => Promise<void>;
}

export const SettingsClientContext = createNamedContext<ISettingsClientContext | undefined>(undefined, "SettingsClientContext");
