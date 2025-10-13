import { FormFullName } from '@/interfaces';

export type LoadingState = 'waiting' | 'loading' | 'success' | 'failed';

export const FRONTEND_DEFAULT_APP_KEY = 'default-app';

export interface ISettingConfiguration {
  id: string;
  category?: string;
  name: string;
  dataType: string;
  editorForm?: FormFullName;
  label?: string;
  description?: string;
  module?: string;
  isClientSpecific: boolean;
}

export type SettingValue = any;

export interface ISettingIdentifier {
  module?: string;
  name: string;
  appKey?: string;
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
