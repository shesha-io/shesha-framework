import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import * as RestfulShesha from '@/utils/fetchers';

export interface UserLoginInfoDto {
  id?: number;
  accountFound?: boolean;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  picture?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  hasRegistered?: boolean;
  loginProvider?: string | null;
  homeUrl?: string | null;
  isSelfServiceUser?: boolean;
  grantedPermissions?: string[] | null;
}
export interface ApplicationInfoDto {
  version?: string | null;
  releaseDate?: string;
  features?: {
    [key: string]: boolean;
  } | null;
}

export interface TenantLoginInfoDto {
  id?: number;
  tenancyName?: string | null;
  name?: string | null;
}
export interface GetCurrentLoginInformationsOutput {
  application?: ApplicationInfoDto;
  user?: UserLoginInfoDto;
  tenant?: TenantLoginInfoDto;
}

export interface GetCurrentLoginInformationsOutputAjaxResponse
  extends IAjaxResponse<GetCurrentLoginInformationsOutput> {}

export type sessionGetCurrentLoginInformationsProps = Omit<
  RestfulShesha.GetProps<GetCurrentLoginInformationsOutputAjaxResponse, IAjaxResponseBase, void, void>,
  'queryParams'
>;

export const sessionGetCurrentLoginInformations = (props: sessionGetCurrentLoginInformationsProps) =>
  RestfulShesha.get<GetCurrentLoginInformationsOutputAjaxResponse, IAjaxResponseBase, void, void>(
    `/api/services/app/Session/GetCurrentLoginInformations`,
    undefined,
    props
  );
