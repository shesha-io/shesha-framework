import { useGet, UseGetProps } from '../hooks/useGet';
import { useMutateForEndpoint } from '../hooks/useMutate';
import { IAjaxResponse } from '../interfaces/ajaxResponse';

export interface PermissionDto {
  id?: string | null;
  name?: string | null;
  displayName?: string | null;
  description?: string | null;
  parentName?: string | null;
  isDbPermission?: boolean;
  parent?: PermissionDto;
  child?: PermissionDto[] | null;
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
  name?: string;
  'api-version'?: string;
}
export const usePermissionDelete = () =>
  useMutateForEndpoint<PermissionDeleteQueryParams>({
    url: (data) => {
      const params = `name=${data.name}` + (Boolean(data['api-version']) ? `&api-version=${data['api-version']}` : '');
      return `/api/services/app/Permission/Delete?${params}`;
    },
    httpVerb: 'DELETE',
  });
