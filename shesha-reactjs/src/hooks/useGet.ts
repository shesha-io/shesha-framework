import { useState } from 'react';
import { useSheshaApplication } from '@/providers';
import { IHttpHeadersDictionary } from '@/providers/sheshaApplication/contexts';
import * as RestfulShesha from '@/utils/fetchers';
import { useDeepCompareCallback, useDeepCompareEffect } from './useDeepCompareEffect';

export interface GetDataError<TError> {
  message: string;
  data: TError | string;
  status?: number;
}
export interface GetState<TData, TError> {
  data: TData | null;
  response: Response | null;
  error: GetDataError<TError> | null;
  loading: boolean;
}
interface IQueryParams {
  [key: string]: any;
}

export interface UseGetProps<TData, /*TError,*/ TQueryParams, TPathParams> {
  /**
   * The path at which to request data,
   * typically composed by parent Gets or the RestfulProvider.
   */
  path: string | ((pathParams: TPathParams) => string);
  /**
   * Path Parameters
   */
  pathParams?: TPathParams;
  /**
   * Query parameters
   */
  queryParams?: TQueryParams;
  /**
   * A function to resolve data return from the backend, most typically
   * used when the backend response needs to be adapted in some way.
   */
  resolve?: (data: any) => TData;
  /**
   * Should we fetch data at a later stage?
   */
  lazy?: boolean;
  /**
   * An escape hatch and an alternative to `path` when you'd like
   * to fetch from an entirely different URL.
   *
   */
  base?: string;

  headers?: IHttpHeadersDictionary;
}

type RefetchOptions<TData, /*TError,*/ TQueryParams, TPathParams> = Partial<
  Omit<UseGetProps<TData, /*TError,*/ TQueryParams, TPathParams>, 'lazy'>
>;

export interface UseGetReturn<TData, TError, TQueryParams = {}, TPathParams = unknown> extends GetState<TData, TError> {
  /**
   * Refetch
   */
  refetch: (options?: RefetchOptions<TData, /*TError,*/ TQueryParams, TPathParams> & { signal?: AbortSignal }) => Promise<TData | null>;
}

export const useGetInternal = <TData = any, TError = any, TQueryParams = IQueryParams, TPathParams = unknown>(
  props: UseGetProps<TData, /*TError,*/ TQueryParams, TPathParams>
): UseGetReturn<TData, TError, TQueryParams, TPathParams> => {
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const [state, setState] = useState<GetState<TData, TError>>({
    error: null,
    loading: !props.lazy,
    data: null,
    response: null,
  });

  const refetch = useDeepCompareCallback(
    (options?: RefetchOptions<TData, /*TError,*/ TQueryParams, TPathParams> & { signal?: AbortSignal }): Promise<TData | null> => {
      setState((prev) => ({ ...prev, loading: true }));

      const finalOptions = { ...props, ...options, httpHeaders: httpHeaders };

      const path =
        typeof finalOptions.path === 'string' ? finalOptions.path : finalOptions.path(finalOptions.pathParams);

      const finalHeaders = { ...httpHeaders, ...(options?.headers ?? {}) };

      return RestfulShesha.get<TData, TError, TQueryParams, TPathParams>(path, finalOptions.queryParams, {
        base: props?.base ?? backendUrl,
        headers: finalHeaders,
      }, options?.signal)
        .then((data) => {
          setState((prev) => ({ ...prev, loading: false, error: null, data: data }));
          return data;
        })
        .catch((error) => {
          setState((prev) => ({ ...prev, loading: false, error: error, data: null }));
          throw error;
        });
    },
    [props.lazy, props.path, props.base, props.resolve, props.queryParams, props.pathParams, backendUrl, httpHeaders]
  );

  useDeepCompareEffect(() => {
    if (!props.lazy) refetch(props);
  }, [props.lazy, props.path, props.base, props.queryParams, props.pathParams, backendUrl, httpHeaders]);

  return {
    ...state,
    refetch,
  };
};

export function useGet<TData = any, TError = any, TQueryParams = IQueryParams, TPathParams = unknown>(
  path: UseGetProps<TData, /*TError,*/ TQueryParams, TPathParams>['path'],
  props: Omit<UseGetProps<TData, /*TError,*/ TQueryParams, TPathParams>, 'path'>
): UseGetReturn<TData, TError, TQueryParams, TPathParams>;

// eslint-disable-next-line no-redeclare
export function useGet<TData = any, TError = any, TQueryParams = IQueryParams, TPathParams = unknown>(
  props: UseGetProps<TData, /*TError,*/ TQueryParams, TPathParams>
): UseGetReturn<TData, TError, TQueryParams, TPathParams>;

// eslint-disable-next-line no-redeclare
export function useGet<TData = any, TError = any, TQueryParams = IQueryParams, TPathParams = unknown>() {
  const props: UseGetProps<TData, TQueryParams, TPathParams> =
    typeof arguments[0] === 'object' ? arguments[0] : { ...arguments[1], path: arguments[0] };
  const { path } = props;

  return useGetInternal<TData, TError, TQueryParams, TPathParams>({ ...props, path });
}
