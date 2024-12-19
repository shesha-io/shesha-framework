import { useGet, UseGetProps } from '@/hooks/useGet';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';

export interface PermissionedObjectDto {
  id?: string;
  object?: string | null;
  category?: string | null;
  moduleName?: string | null;
  module?: string | null;
  type?: string | null;
  name?: string | null;
  description?: string | null;
  permissions?: string[] | null;
  actualPermissions?: string[] | null;
  inherited?: boolean;
  access?: number | null;
  actualAccess?: number | null;
  parent?: string | null;
  dependency?: string | null;
  children?: PermissionedObjectDto[] | null;
  hidden?: boolean;
  hardcoded?: boolean | null;
}

export type PermissionedObjectDtoListAjaxResponse = IAjaxResponse<PermissionedObjectDto[] | null>;

export interface PermissionedObjectGetAllTreeQueryParams {
  type?: string;
  showHidden?: boolean;
}

export type UsePermissionedObjectGetAllTreeProps = Omit<
  UseGetProps<PermissionedObjectDtoListAjaxResponse, PermissionedObjectGetAllTreeQueryParams, void>,
  'path'
>;

/**
 * Get hierarchical list of protected objects
 */
export const usePermissionedObjectGetAllTree = (props: UsePermissionedObjectGetAllTreeProps) =>
  useGet<PermissionedObjectDtoListAjaxResponse, IAjaxResponseBase, PermissionedObjectGetAllTreeQueryParams, void>(
    `/api/services/app/PermissionedObject/GetAllTree`,
    props
  );
