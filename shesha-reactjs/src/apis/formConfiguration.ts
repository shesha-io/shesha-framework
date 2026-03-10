import { IAjaxResponse } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';
import { FormIdFullNameDto } from './entityConfig';

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
  access?: number | undefined;
  /** Form permissions for Required premission mode */
  permissions?: string[] | undefined;
}

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