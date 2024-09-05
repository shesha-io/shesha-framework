import { IAjaxResponse } from '@/interfaces/ajaxResponse';

export interface AuthenticateResultModel {
  accessToken?: string | null;
  encryptedAccessToken?: string | null;
  expireInSeconds?: number;
  expireOn?: string;
  userId?: number;
  personId?: string | null;
  deviceName?: string | null;
  redirect?: Boolean;
  url?: string;
}

export interface AuthenticateResultModelAjaxResponse extends IAjaxResponse<AuthenticateResultModel> {}

export interface AuthenticateModel {
  userNameOrEmailAddress: string;
  password: string;
  /**
   * Optional IMEI number. Is used for mobile applications
   */
  imei?: string | null;
}
