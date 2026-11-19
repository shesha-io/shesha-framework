import { IAjaxResponse } from '@/interfaces/ajaxResponse';

type AuthenticateResultType = 0 | 1 | 2;

interface AuthenticateResultModel {
  accessToken?: string | null;
  encryptedAccessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
  userId?: number;
  personId?: string | null;
  deviceName?: string | null;
  redirect?: boolean;
  url?: string;
  resultType?: AuthenticateResultType;
  redirectUrl?: string;
  redirectModule?: string;
  redirectForm?: string;
  /** Single-use token for completing an incomplete self-registration (returned with resultType 2) */
  registrationCompletionToken?: string | null;
  requireChangePassword?: boolean;
}

export type AuthenticateResultModelAjaxResponse = IAjaxResponse<AuthenticateResultModel>;

interface RefreshTokenResultModel {
  accessToken?: string;
  expireInSeconds?: number;
  expireOn?: string;
}

export type RefreshTokenResultModelAjaxResponse = IAjaxResponse<RefreshTokenResultModel>;
