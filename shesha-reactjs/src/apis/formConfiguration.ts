import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';

/**
 * Status of the Shesha.Domain.ConfigurationItems.ConfigurationItem
 */
export type ConfigurationItemVersionStatus = 1 | 2 | 3 | 4 | 5;

/**
 * Form configuration DTO
 */
export interface FormConfigurationDto {
  id?: string;
  /**
   * Module Id
   */
  moduleId?: string | null;
  /**
   * Origin id
   */
  originId?: string | null;
  /**
   * Module name
   */
  module?: string | null;
  /**
   * Form name
   */
  name?: string | null;
  /**
   * Label
   */
  label?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Markup in JSON format
   */
  markup?: string | null;
  /**
   * Type of the form model
   */
  modelType?: string | null;
  /**
   * Version number
   */
  versionNo?: number;
  /**
   * If true, indicates that this is a last version of the form
   */
  isLastVersion?: boolean;
  versionStatus?: ConfigurationItemVersionStatus;
  suppress?: boolean;
  /**
   * Cache MD5, is used for client-side caching
   */
  cacheMd5?: string | null;
}

export type FormConfigurationDtoAjaxResponse = IAjaxResponse<FormConfigurationDto>;
export interface FormConfigurationGetQueryParams {
  /**
   * Form configuration id
   */
  id?: string;
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

export type formConfigurationGetProps = Omit<
  RestfulShesha.GetProps<FormConfigurationDtoAjaxResponse, IAjaxResponseBase, FormConfigurationGetQueryParams, void>,
  'queryParams'
>;
export const formConfigurationGet = (queryParams: FormConfigurationGetQueryParams, props: formConfigurationGetProps) =>
  RestfulShesha.get<FormConfigurationDtoAjaxResponse, IAjaxResponseBase, FormConfigurationGetQueryParams, void>(
    `/api/services/Shesha/FormConfiguration/Get`,
    queryParams,
    props
  );

export interface FormConfigurationGetByNameQueryParams {
  /**
   * Module name
   */
  module?: string;
  /**
   * Form name
   */
  name?: string;
  /**
   * Form version number. Last published form is used when missing
   */
  version?: number;
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

export type formConfigurationGetByNameProps = Omit<
  RestfulShesha.GetProps<
    FormConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    FormConfigurationGetByNameQueryParams,
    void
  >,
  'queryParams'
>;
/**
 * Get current form configuration by name
 */
export const formConfigurationGetByName = (
  queryParams: FormConfigurationGetByNameQueryParams,
  props: formConfigurationGetByNameProps
) =>
  RestfulShesha.get<FormConfigurationDtoAjaxResponse, IAjaxResponseBase, FormConfigurationGetByNameQueryParams, void>(
    `/api/services/Shesha/FormConfiguration/GetByName`,
    queryParams,
    props
  );

/**
 * Form update markup input
 */
export interface FormUpdateMarkupInput {
  id?: string;
  /**
   * Form markup (components) in JSON format
   */
  markup?: string | null;
}

export interface FormConfigurationUpdateMarkupQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type formConfigurationUpdateMarkupProps = Omit<
  RestfulShesha.MutateProps<void, unknown, FormConfigurationUpdateMarkupQueryParams, FormUpdateMarkupInput, void>,
  'data'
>;
/**
 * Update form markup
 */
export const formConfigurationUpdateMarkup = (data: FormUpdateMarkupInput, props: formConfigurationUpdateMarkupProps) =>
  RestfulShesha.mutate<void, unknown, FormConfigurationUpdateMarkupQueryParams, FormUpdateMarkupInput, void>(
    'PUT',
    `/api/services/Shesha/FormConfiguration/UpdateMarkup`,
    data,
    props
  );
