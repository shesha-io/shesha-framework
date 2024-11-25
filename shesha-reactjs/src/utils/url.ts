import qs, { ParsedQs } from 'qs';

const getCurrentQueryString = (): string => {
  return typeof window !== 'undefined' ? window.location?.search ?? '' : '';
};

export const normalizeUrl = (url: string): string => {
  return url === '/' ? url : (url ?? '').endsWith('/') ? (url || '').substring(0, url.length - 1) : url;
};

export const isSameUrls = (url1: string, url2: string): boolean => {
  return normalizeUrl(url1) === normalizeUrl(url2);
};

export const getUrlWithoutQueryParams = (url: string): string => {
  if (!url) return url;
  const idx = url.indexOf('?');
  return idx > -1 ? url.substring(0, idx) : url;
};

export const getQueryString = (url: string) => {
  try {
    const idx = url?.indexOf('?');

    return typeof idx !== 'number' || idx === -1 ? undefined : url.substring(idx);
  } catch {
    return undefined;
  }
};

export type QueryStringParams = ParsedQs;

export const getQueryParams = (url?: string): QueryStringParams => {
  const effectiveUrl = url ? decodeURIComponent(url) : getCurrentQueryString();
  const queryString = getQueryString(effectiveUrl);

  return qs.parse(queryString, { ignoreQueryPrefix: true });
};

export const getQueryParam = (name: string, url?: string) => {
  const result = getQueryParams(url)[name];

  return result;
};

export const setQueryParam = (url: string, key: string, value: string): string => {
  const urlObj = new URL(decodeURIComponent(url));

  const urlSearchParams = new URLSearchParams(urlObj.search ?? '');
  const params = Object.fromEntries(urlSearchParams.entries());
  params[key] = encodeURIComponent(value);

  return `${urlObj?.host}${urlObj?.pathname}?${qs.stringify(params)}`;
};

export const isValidSubmitVerb = (submitVerb: string) => {
  return ['POST', 'PUT', 'PATCH', 'DELETE']?.includes(submitVerb?.trim()?.toLocaleUpperCase());
};

export const joinUrlAndPath = (baseUrl: string, path: string) => {
  const newBase = baseUrl?.endsWith('/') ? baseUrl : baseUrl?.substring(0, baseUrl?.length - 2); // Remove the end forward slash
  const newPath = path?.startsWith('/') ? path : `/${path}`;

  return `${newBase}${newPath}`;
};

export function removeURLParameter(url: string, parameter: string) {
  if (!url) return url;
  //prefer to use l.search if you have a location/link object
  const urlParts = url.split('?');
  if (urlParts.length >= 2) {
    const prefix = encodeURIComponent(parameter) + '=';
    const pars = urlParts[1].split(/[&;]/g);

    //reverse iteration as may be destructive
    for (let i = pars.length; i-- > 0; ) {
      //idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    return urlParts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
  }
  return url;
}


export const buildUrl = (url: string, queryParams?: Record<string, any>) => {
  const urlWithoutQuery = getUrlWithoutQueryParams(url);
  const urlQueryPatams = getQueryParams(url);

  const queryStringData = { ...urlQueryPatams, ...queryParams };

  const queryString = qs.stringify(queryStringData);
  const preparedUrl = queryString
    ? `${urlWithoutQuery}?${queryString}`
    : urlWithoutQuery;
  return preparedUrl;
};