import { IAjaxResponse } from '@/interfaces/ajaxResponse';

export type AuthenticateResultType = 0 | 1 | 2;

export interface AuthenticateResultModel {
  accessToken?: string | null;
  encryptedAccessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
  userId?: number;
  personId?: string | null;
  deviceName?: string | null;
  resultType?: AuthenticateResultType;
  redirectUrl?: string;
  redirectModule?: string;
  redirectForm?: string;
}

export type AuthenticateResultModelAjaxResponse = IAjaxResponse<AuthenticateResultModel>;

export interface AuthenticateModel {
  userNameOrEmailAddress: string;
  password: string;
  /**
   * Optional IMEI number. Is used for mobile applications
   */
  imei?: string | null;
}
