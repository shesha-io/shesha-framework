import { useGet, UseGetProps } from '@/hooks/useGet';
import { useMutateForEndpoint } from '@/hooks/useMutate';
import { IAjaxResponse } from '@/interfaces/ajaxResponse';
import { GuidEntityReferenceDto } from './common';
import { buildUrl } from '@/utils';

export interface PermissionDto {
  id?: string | null;
  module?: GuidEntityReferenceDto | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  parentName?: string | null;
  isDbPermission?: boolean | undefined;
  parent?: PermissionDto | undefined;
  child?: PermissionDto[] | undefined;
}

export interface PermissionGetAllTreeQueryParams {
  'api-version'?: string;
}

export type PermissionDtoListAjaxResponse = IAjaxResponse<PermissionDto[] | null>;

export type UsePermissionGetAllTreeProps = Omit<
  UseGetProps<PermissionDtoListAjaxResponse, PermissionGetAllTreeQueryParams, void>,
  'path'
>;

export const usePermissionGetAllTree = (props: UsePermissionGetAllTreeProps) =>
  useGet<PermissionDtoListAjaxResponse, unknown, PermissionGetAllTreeQueryParams, void>(
    `/api/services/app/Permission/GetAllTree`,
    props
  );

export const usePermissionUpdateParent = () =>
  useMutateForEndpoint<PermissionDto>({ url: `/api/services/app/Permission/UpdateParent`, httpVerb: 'PUT' });

export interface PermissionDeleteQueryParams {
  name: string;
  'api-version'?: string;
}
export const usePermissionDelete = () =>
  useMutateForEndpoint<PermissionDeleteQueryParams>({
    url: (data) => {
      return buildUrl("/api/services/app/Permission/Delete", data);
    },
    httpVerb: 'DELETE',
  });
