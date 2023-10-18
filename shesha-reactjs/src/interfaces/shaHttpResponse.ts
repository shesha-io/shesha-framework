import { IHttpResponseError } from './httpResponseError';

export interface IShaHttpResponse<T> {
  readonly result: T;
  readonly targetUrl: string;
  readonly success: boolean;
  readonly unAuthorizedRequest: boolean;
  readonly error: IHttpResponseError;
}
