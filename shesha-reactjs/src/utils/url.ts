import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import qs, { ParsedQs } from 'qs';

const getCurrentQueryString = (): string => {
  return isDefined(window) && isDefined(window.location)
    ? window.location.search
    : '';
};

export const normalizeUrl = (url: string | null | undefined): string | undefined => {
  if (isNullOrWhiteSpace(url))
    return undefined;

  return url === '/'
    ? url
    : url.endsWith('/')
      ? url.substring(0, url.length - 1)
      : url;
};

export const isSameUrls = (url1: string, url2: string): boolean => {
  return normalizeUrl(url1) === normalizeUrl(url2);
};

export const getUrlWithoutQueryParams = (url: string): string => {
  if (!url) return url;
  const idx = url.indexOf('?');
  return idx > -1 ? url.substring(0, idx) : url;
};

export const getQueryString = (url: string): string | undefined => {
  try {
    if (isNullOrWhiteSpace(url))
      return undefined;
    const idx = url.indexOf('?');

    return idx === -1 ? undefined : url.substring(idx);
  } catch {
    return undefined;
  }
};

export type QueryStringParams = ParsedQs;
type QueryStringParam = QueryStringParams[string];

export const getQueryParams = (url?: string): QueryStringParams => {
  const effectiveUrl = url ? decodeURIComponent(url) : getCurrentQueryString();
  const queryString = getQueryString(effectiveUrl);

  return queryString
    ? qs.parse(queryString, { ignoreQueryPrefix: true })
    : {};
};

export const getQueryParam = (name: string, url?: string): QueryStringParam => {
  const result = getQueryParams(url)[name];

  return result;
};

export const setQueryParam = (url: string, key: string, value: string): string => {
  const urlObj = new URL(decodeURIComponent(url));

  const urlSearchParams = new URLSearchParams(urlObj.search || '');
  const params = Object.fromEntries(urlSearchParams.entries());
  params[key] = encodeURIComponent(value);

  return `${urlObj.host}${urlObj.pathname}?${qs.stringify(params)}`;
};

export const isValidSubmitVerb = (submitVerb: string): boolean => {
  return !isNullOrWhiteSpace(submitVerb) && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(submitVerb.trim().toLocaleUpperCase());
};

export const joinUrlAndPath = (baseUrl: string, path: string): string => {
  const newBase = baseUrl.endsWith('/') ? baseUrl : baseUrl.substring(0, baseUrl.length - 2); // Remove the end forward slash
  const newPath = path.startsWith('/') ? path : `/${path}`;

  return `${newBase}${newPath}`;
};

export function removeURLParameter(url: string, parameter: string): string {
  if (!url) return url;

  const [baseUrl, queryString = ''] = url.split('?');
  if (queryString === '') return url;

  const parsed = qs.parse(queryString);
  if (!(parameter in parsed))
    return url;
  delete parsed[parameter];
  const newQueryString = qs.stringify(parsed);
  return isNullOrWhiteSpace(newQueryString)
    ? baseUrl
    : baseUrl + '?' + newQueryString;
}


export const buildUrl = (url: string, queryParams?: object): string => {
  const urlWithoutQuery = getUrlWithoutQueryParams(url);
  const urlQueryPatams = getQueryParams(url);

  const queryStringData = { ...urlQueryPatams, ...queryParams };

  const queryString = qs.stringify(queryStringData);
  const preparedUrl = queryString
    ? `${urlWithoutQuery}?${queryString}`
    : urlWithoutQuery;
  return preparedUrl;
};
