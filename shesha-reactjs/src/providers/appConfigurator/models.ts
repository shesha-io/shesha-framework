export type ApplicationMode = 'live' | 'edit';
export type ConfigurationItemsViewMode = 'live' | 'ready' | 'latest';

export interface IComponentSettingsDictionary {
  [key: string]: IComponentSettings;
}

export interface ITargetForm {
  formName?: string;
}

export interface IComponentSettings<TSettings = object> {
  id?: string;
  name?: string;
  description?: string;
  settings: TSettings;
  /**
   * Cache MD5, is used for client-side caching
   */
  cacheMd5?: string | null;
}
