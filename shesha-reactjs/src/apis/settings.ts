import { IAjaxResponse, IAjaxResponseBase } from '../interfaces/ajaxResponse';
import * as RestfulShesha from '../utils/fetchers';

export type ObjectAjaxResponse = IAjaxResponse<{} | null>;

export interface SettingsGetValueQueryParams {
  /**
   * Front-end application key, see <seealso cref="P:Shesha.Domain.FrontEndApp.AppKey" />. Is used for client-specific applications only.
   * NOTE: this parameter if optional with fallback to the `sha-frontend-application` header
   */
  appKey?: string;
  /**
   * Setting name
   */
  name?: string;
  /**
   * Module name
   */
  module?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type settingsGetValueProps = Omit<
  RestfulShesha.GetProps<ObjectAjaxResponse, IAjaxResponseBase, SettingsGetValueQueryParams, void>,
  'queryParams'
>;
/**
 * Get setting value
 */
export const settingsGetValue = (queryParams: SettingsGetValueQueryParams, props: settingsGetValueProps) =>
  RestfulShesha.get<ObjectAjaxResponse, IAjaxResponseBase, SettingsGetValueQueryParams, void>(
    `/api/services/app/Settings/GetValue`,
    queryParams,
    props
  );

export interface SettingsUpdateValueQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

/**
 * Update setting value input
 */
export interface UpdateSettingValueInput {
  /**
   * Setting name
   */
  name?: string | null;
  /**
   * Module name
   */
  module?: string | null;
  /**
   * Setting value
   */
  value?: {} | null;
  /**
   * Front-end application key, see <seealso cref="P:Shesha.Domain.FrontEndApp.AppKey" />. Is used for client-specific applications only
   */
  appKey?: string | null;
}

export type settingsUpdateValueProps = Omit<
  RestfulShesha.MutateProps<void, unknown, SettingsUpdateValueQueryParams, UpdateSettingValueInput, void>,
  'data'
>;
/**
 * Update setting value
 */
export const settingsUpdateValue = (data: UpdateSettingValueInput, props: settingsUpdateValueProps) =>
  RestfulShesha.mutate<void, unknown, SettingsUpdateValueQueryParams, UpdateSettingValueInput, void>(
    'POST',
    `/api/services/app/Settings/UpdateValue`,
    data,
    props
  );
