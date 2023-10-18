import { IAjaxResponse, IAjaxResponseBase } from '../interfaces/ajaxResponse';
import * as RestfulShesha from '../utils/fetchers';

export interface ConfigurableComponentGetByNameQueryParams {
  /**
   * Module name
   */
  module?: string;
  /**
   * Component name
   */
  name?: string;
  /**
   * If true, indicates that component is application specific
   */
  isApplicationSpecific?: boolean;
  /**
   * MD5 of the item. Is used for the client side caching.
   * If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
   */
  md5?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

/**
 * Configurable Component DTO
 */
export interface ConfigurableComponentDto {
  id?: string;
  /**
   * Form name
   */
  name?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Settings in JSON format
   */
  settings?: string | null;
  /**
   * Cache MD5, is used for client-side caching
   */
  cacheMd5?: string | null;
}

export type ConfigurableComponentDtoAjaxResponse = IAjaxResponse<ConfigurableComponentDto>;

export type configurableComponentGetByNameProps = Omit<
  RestfulShesha.GetProps<
    ConfigurableComponentDtoAjaxResponse,
    IAjaxResponseBase,
    ConfigurableComponentGetByNameQueryParams,
    void
  >,
  'queryParams'
>;
/**
 * Get current component configuration by name
 */
export const configurableComponentGetByName = (
  queryParams: ConfigurableComponentGetByNameQueryParams,
  props: configurableComponentGetByNameProps
) =>
  RestfulShesha.get<
    ConfigurableComponentDtoAjaxResponse,
    IAjaxResponseBase,
    ConfigurableComponentGetByNameQueryParams,
    void
  >(`/api/services/Shesha/ConfigurableComponent/GetByName`, queryParams, props);

export interface ConfigurableComponentUpdateSettingsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

/**
 * Update component settings input
 */
export interface ConfigurableComponentUpdateSettingsInput {
  /**
   * Module name
   */
  module?: string | null;
  /**
   * Component name
   */
  name?: string | null;
  /**
   * If true, indicates that component is application specific
   */
  isApplicationSpecific?: boolean;
  /**
   * Settings in JSON format
   */
  settings?: string | null;
}

export type configurableComponentUpdateSettingsProps = Omit<
  RestfulShesha.MutateProps<
    void,
    unknown,
    ConfigurableComponentUpdateSettingsQueryParams,
    ConfigurableComponentUpdateSettingsInput,
    void
  >,
  'data'
>;
export const configurableComponentUpdateSettings = (
  data: ConfigurableComponentUpdateSettingsInput,
  props: configurableComponentUpdateSettingsProps
) =>
  RestfulShesha.mutate<
    void,
    unknown,
    ConfigurableComponentUpdateSettingsQueryParams,
    ConfigurableComponentUpdateSettingsInput,
    void
  >('PUT', `/api/services/Shesha/ConfigurableComponent/UpdateSettings`, data, props);
