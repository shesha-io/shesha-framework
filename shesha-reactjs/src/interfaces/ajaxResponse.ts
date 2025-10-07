import { AxiosResponse } from 'axios';
import { IErrorInfo } from './errorInfo';

export interface IAjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: IErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface IAjaxSuccessResponse<T> extends IAjaxResponseBase {
  success: true;
  result: T;
}
export interface IAjaxResponse<T> extends IAjaxResponseBase {
  result?: T;
}

export const isAjaxResponseBase = (value: any): value is IAjaxResponseBase => {
  const typed = value as IAjaxResponseBase;;
  return value && typeof(value) === 'object'
    && typed.__abp !== undefined
    && typed.success !== undefined
    && typed.error !== undefined;
};

export const isAjaxSuccessResponse = <T>(value: IAjaxResponse<T>): value is IAjaxSuccessResponse<T> => value && value.success === true;

export const isAxiosResponse = (value: any): value is AxiosResponse => {
  const typed = value as AxiosResponse;
  return value && typeof(typed.status) === 'number' && typed.data && typeof(typed.config) === 'object';
};