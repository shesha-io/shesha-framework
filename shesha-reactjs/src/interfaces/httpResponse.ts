import { IShaHttpResponse } from './shaHttpResponse';
import { HttpStatusCodes } from '../enums/httpStatusCodes';

export interface IHttpResponse<T> {
  readonly data: IShaHttpResponse<T>;
  readonly message: string;
  readonly status: HttpStatusCodes;
}
