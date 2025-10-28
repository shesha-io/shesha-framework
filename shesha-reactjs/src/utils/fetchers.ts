import axios, { AxiosInstance } from 'axios';
import { IAjaxResponse } from '@/interfaces/ajaxResponse';
import { DEFAULT_ACCESS_TOKEN_NAME } from '@/providers/sheshaApplication/contexts';
import { requestHeaders } from './requestHeaders';
import { buildUrl } from './url';
import { HttpResponse } from '@/publicJsApis/httpClient';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { Key } from 'react';

export function constructUrl<TQueryParams extends object = object>(base: string | undefined, path: string, queryParams?: TQueryParams): string {
  let normalizedBase = !isNullOrWhiteSpace(base) ? base : '';
  normalizedBase = normalizedBase.endsWith('/') ? normalizedBase : `${normalizedBase}/`;

  let trimmedPath = Boolean(path) ? path : '';
  trimmedPath = trimmedPath.startsWith('/') ? trimmedPath.slice(1) : trimmedPath;

  const encodedPathWithParams = Object.keys(queryParams || {}).length
    ? buildUrl(trimmedPath, queryParams)
    : trimmedPath;

  const composed = normalizedBase + encodedPathWithParams;

  return composed;
}

export interface BaseRequestOptions {
  /**
   * An escape hatch and an alternative to `path` when you'd like
   * to fetch from an entirely different URL.
   *
   */
  base?: string;
  /** Options passed into the fetch call. */
  headers?: HeadersInit;
}

export interface GetProps<
  _TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any;
  },
  _TPathParams = any,
> extends BaseRequestOptions {
  queryParams?: TQueryParams;
}

export const get = <
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any;
  },
  _TPathParams = any,
>(
  path: string,
  queryParams: TQueryParams | undefined,
  props: Omit<GetProps<TData, TError, TQueryParams, _TPathParams>, 'queryParams'>,
  signal?: RequestInit['signal'],
): Promise<TData | null> => {
  const url = constructUrl(props?.base, path, typeof (queryParams) === 'object' ? queryParams as object : undefined);
  const headers = {
    'content-type': 'application/json',
    ...(props?.headers || {}),
  };

  return fetch(url, {
    headers,
    signal,
  }).then((res) => {
    return res.ok ? res.json() : res;
  });
};

export interface MutateProps<
  _TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any;
  },
  TRequestBody = any,
  /** is used by the react hooks only */
  _TPathParams = any,
> extends BaseRequestOptions {
  data: TRequestBody | null;
  queryParams?: TQueryParams;
  signal?: RequestInit['signal'];
  // options?: MutateRequestOptions<TQueryParams, TPathParams>
}

export const mutate = <
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any;
  },
  TRequestBody = any,
  /** is used by the react hooks only */
  _TPathParams = any,
>(
  method: string,
  path: string,
  data: TRequestBody,
  props: Omit<MutateProps<TData, TError, TQueryParams, TRequestBody, _TPathParams>, 'data'>,
): Promise<TData | null> => {
  let fixedPath = path;
  if (method === 'DELETE' && typeof data === 'string') {
    fixedPath += `/${data}`;
  }
  const url = constructUrl(props.base, fixedPath, typeof (props.queryParams) === 'object' ? props.queryParams as object : undefined);

  const headers = {
    'content-type': 'application/json',
    ...(props?.headers || {}),
  };

  const { signal } = props || {};

  return fetch(url, {
    method,
    body: JSON.stringify(data),
    headers,
    signal,
  }).then((res) => res.json());
};

export const getFileNameFromContentDisposition = (disposition: string): string | undefined => {
  if (!disposition)
    return undefined;
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i;
  const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

  if (utf8FilenameRegex.test(disposition)) {
    return decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
  } else {
    // prevent ReDos attacks by anchoring the ascii regex to string start and
    //  slicing off everything before 'filename='
    const filenameStart = disposition.toLowerCase().indexOf('filename=');
    if (filenameStart >= 0) {
      const partialDisposition = disposition.slice(filenameStart);
      const matches = asciiFilenameRegex.exec(partialDisposition);
      if (matches != null && matches[2]) {
        return matches[2];
      }
    }
  }
  return undefined;
};

export const getFileNameFromResponse = (fileResponse: HttpResponse<any>): string | undefined => {
  return getFileNameFromContentDisposition(fileResponse.headers['content-disposition']);
};

export const unwrapAbpResponse = <TData extends any, TResponse extends TData | IAjaxResponse<TData>>(response: TResponse): TData | TResponse => {
  if (!response) return response;

  const ajaxResponse = response as IAjaxResponse<TData>;
  const result = ajaxResponse.success && ajaxResponse.result ? ajaxResponse.result : response;

  return result;
};

export const axiosHttp = (baseURL: string, tokenName?: string): AxiosInstance =>
  axios.create({
    baseURL,
    headers: requestHeaders(tokenName || DEFAULT_ACCESS_TOKEN_NAME, { addCustomHeaders: true }),
  });


export interface IQueryParams {
  [name: string]: Key;
}
export type FetcherOptions = {
  path: string;
  queryParams?: IQueryParams;
};
