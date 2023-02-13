import { AxiosResponse } from "axios";
import qs from "qs";

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
  _TPathParams = any
>(
  path: string,
  queryParams: TQueryParams,
  props: Omit<GetProps<TData, TError, TQueryParams, _TPathParams>, 'queryParams'>,
  signal?: RequestInit["signal"],
): Promise<TData | null> => {
  const url = constructUrl(props?.base, path, queryParams);
  const headers = {
    "content-type": "application/json",
    ...(props?.headers || {})
  };

  return fetch(url, {
    headers,
    signal
  }).then(res => {
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
  _TPathParams = any
  > extends BaseRequestOptions {
  data: TRequestBody | null;
  queryParams?: TQueryParams;
  signal?: RequestInit["signal"]
  //options?: MutateRequestOptions<TQueryParams, TPathParams>
}

export const mutate = <
  TData = any,
  TError = any,
  TQueryParams = {
    [key: string]: any;
  },
  TRequestBody = any,
  /** is used by the react hooks only */
  _TPathParams = any
>(
  method: string,
  path: string,
  data: TRequestBody,
  props: Omit<MutateProps<TData, TError, TQueryParams, TRequestBody, _TPathParams>, 'data'>,
): Promise<TData | null> => {
  let fixedPath = path;
  if (method === "DELETE" && typeof data === "string") {
    fixedPath += `/${data}`;
  }
  const url = constructUrl(props.base, fixedPath, props.queryParams);

  const headers = {
    "content-type": "application/json",
    ...(props?.headers || {})
  };

  const { signal } = props || {};

  return fetch(url, {
    method,
    body: JSON.stringify(data),
    headers,
    signal,
  }).then(res => res.json());
};

export function constructUrl<TQueryParams>(
  base: string,
  path: string,
  queryParams?: TQueryParams,
) {
  let normalizedBase = Boolean(base) ? base : '';
  normalizedBase = normalizedBase.endsWith("/") ? normalizedBase : `${normalizedBase}/`;

  let trimmedPath = Boolean(path) ? path : '';
  trimmedPath = trimmedPath.startsWith("/") ? trimmedPath.slice(1) : trimmedPath;

  const encodedPathWithParams = Object.keys(queryParams || {}).length
    ? `${trimmedPath}?${qs.stringify(queryParams)}`
    : trimmedPath;

  const composed = normalizedBase + encodedPathWithParams;

  return composed;
}

export const getFileNameFromContentDisposition = (disposition: string): string => {
  if (!disposition)
    return null;
  const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i;
  const asciiFilenameRegex = /^filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

  let fileName: string = null;
  if (utf8FilenameRegex.test(disposition)) {
    fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
  } else {
    // prevent ReDos attacks by anchoring the ascii regex to string start and
    //  slicing off everything before 'filename='
    const filenameStart = disposition.toLowerCase().indexOf('filename=');
    if (filenameStart >= 0) {
      const partialDisposition = disposition.slice(filenameStart);
      const matches = asciiFilenameRegex.exec(partialDisposition);
      if (matches != null && matches[2]) {
        fileName = matches[2];
      }
    }
  }
  return fileName;
}

export const getFileNameFromResponse = (fileResponse: AxiosResponse<any>): string => {
  return getFileNameFromContentDisposition(fileResponse.headers['content-disposition']);
}