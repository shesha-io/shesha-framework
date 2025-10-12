import { AxiosResponse } from 'axios';
import { IErrorInfo } from './errorInfo';

interface IAjaxResponseCommon {
  targetUrl?: string | null;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface IAjaxSuccessResponse<T> extends IAjaxResponseCommon {
  success: true;
  result: T;
}
export interface IAjaxErrorResponse extends IAjaxResponseCommon {
  success: false;
  error: IErrorInfo;
}

export type IAjaxResponse<T> = IAjaxSuccessResponse<T> | IAjaxErrorResponse;
export type IAjaxResponseBase = IAjaxResponseCommon | IAjaxErrorResponse;

export const isAjaxSuccessResponse = <T>(value: IAjaxResponse<T>): value is IAjaxSuccessResponse<T> => value && value.success === true;
export const isAjaxErrorResponse = (value: unknown): value is IAjaxErrorResponse => value && typeof (value) === 'object' && "success" in value && value.success === false;

export const isAxiosResponse = (value: unknown): value is AxiosResponse => {
  const typed = value as AxiosResponse;
  return value && typeof (typed.status) === 'number' && typed.data && typeof (typed.config) === 'object';
};

export const extractAjaxResponse = <T>(response: IAjaxResponse<T>, errorMessage?: string): T => {
  if (isAjaxSuccessResponse(response))
    return response.result;
  else
    throw errorMessage ? new Error(errorMessage, { cause: response.error }) : new Error(response.error.message);
};
