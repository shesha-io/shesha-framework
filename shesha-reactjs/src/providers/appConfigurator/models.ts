export type ApplicationMode = 'live' | 'edit';

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
