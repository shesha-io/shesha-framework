import { createNamedContext } from '@/utils/react';
import { ISettingIdentifier } from './models';

export interface ILoadSettingPayload {
  module: string;
  name: string;
}

export interface ISettingsActionsContext {
  getSetting: <TValue = unknown>(settingId: ISettingIdentifier) => Promise<TValue>;
}

export type ISettingsContext = ISettingsActionsContext;

export const SettingsContext = createNamedContext<ISettingsActionsContext>(undefined, "SettingsContext");
