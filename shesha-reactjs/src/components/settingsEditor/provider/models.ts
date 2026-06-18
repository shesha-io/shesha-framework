import { FormFullName } from '@/interfaces';

export type LoadingState = 'waiting' | 'loading' | 'success' | 'failed';

export const FRONTEND_DEFAULT_APP_KEY = 'default-app';

export interface ISettingConfiguration {
  id: string;
  category?: string | undefined;
  name: string;
  dataType: string;
  editorForm?: FormFullName | undefined;
  label?: string | undefined;
  description?: string | undefined;
  module?: string | undefined;
  isClientSpecific: boolean;
}

export type SettingValue = unknown;

export interface ISettingIdentifier {
  module?: string | undefined;
  name: string;
  appKey?: string | undefined;
}

export interface IFrontEndApplication {
  name: string;
  appKey: string;
}

export interface FrontEndApplicationDto {
  id: string;
  name: string;
  appKey: string;
  description?: string;
}
