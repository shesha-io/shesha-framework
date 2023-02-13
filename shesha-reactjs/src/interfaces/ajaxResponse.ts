import { IErrorInfo } from './errorInfo';

export interface IAjaxResponseBase {
  targetUrl?: string | null;
  success?: boolean;
  error?: IErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
}

export interface IAjaxResponse<T> extends IAjaxResponseBase{
  result?: T;
}