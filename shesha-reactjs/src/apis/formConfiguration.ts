import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';
import { FormIdFullNameDto } from './entityConfig';

/**
 * Form configuration DTO
 */
export interface FormConfigurationDto {
  id: string;
  /**
   * Module Id
   */
  moduleId: string | null;
  /**
   * Origin id
   */
  originId: string | null;
  /**
   * Module name
   */
  module: string;
  /**
   * Form name
   */
  name: string;
  /**
   * Label
   */
  label: string | null;
  /**
   * Description
   */
  description: string | null;
  /**
   * Markup in JSON format
   */
  markup: string;
  /**
   * Type of the form model
   */
  modelType: string | null;
  suppress: boolean;

  access: number | null;
  permissions: string[];

  /**
   * Cache MD5, is used for client-side caching
   */
  cacheMd5: string | null;
}

export type FormConfigurationDtoAjaxResponse = IAjaxResponse<FormConfigurationDto>;
export interface FormConfigurationGetQueryParams {
  /**
   * Form configuration id
   */
  id: string;
  /**
   * MD5 of the item. Is used for the client side caching.
   * If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
   */
  md5: string | null;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type formConfigurationGetProps = Omit<
  RestfulShesha.GetProps<FormConfigurationDtoAjaxResponse, IAjaxResponseBase, FormConfigurationGetQueryParams, void>,
  'queryParams'
>;

export interface FormConfigurationGetByNameQueryParams {
  /**
   * Module name
   */
  module: string | null;
  /**
   * Form name
   */
  name: string;
  /**
   * MD5 of the item. Is used for the client side caching.
   * If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
   */
  md5: string | null;
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
 * Form update markup input
 */
export interface FormUpdateMarkupInput {
  id?: string;
  /**
   * Form markup (components) in JSON format
   */
  markup?: string | null;
  /** Form asscess mode */
  access?: number;
  /** Form permissions for Required premission mode */
  permissions?: string[];
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


export interface FormPermissionsDto {
  name?: string | null;
  module?: string | null;
  permissions?: string[] | null;
}

export type FormPermissionsDtoAjaxResponse = IAjaxResponse<FormPermissionsDto[]>;

export interface FormConfigurationCheckPermissionsQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}
export type formConfigurationCheckPermissionsProps = Omit<
  RestfulShesha.MutateProps<FormPermissionsDtoAjaxResponse, unknown, FormConfigurationCheckPermissionsQueryParams, FormIdFullNameDto[], void>,
  'data'
>;
/**
 * Check forms permissions
 */
export const formConfigurationCheckPermissions = (data: FormIdFullNameDto[], props: formConfigurationCheckPermissionsProps) =>
  RestfulShesha.mutate<FormPermissionsDtoAjaxResponse, unknown, FormConfigurationCheckPermissionsQueryParams, FormIdFullNameDto[], void>(
    'POST',
    `/api/services/Shesha/FormConfiguration/CheckPermissions`,
    data,
    props
  );