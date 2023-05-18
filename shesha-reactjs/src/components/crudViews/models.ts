import { GetDataError, GetState, UseGetProps } from 'hooks/useGet';

export interface MutateState<TData, TError> {
  error: GetState<TData, TError>["error"];
  loading: boolean;
}

export interface MutateRequestOptions<TQueryParams, TPathParams> extends RequestInit {
  /**
   * Query parameters
   */
  queryParams?: TQueryParams;
  /**
   * Path parameters
   */
  pathParams?: TPathParams;
}

export type MutateMethod<TData, TRequestBody, TQueryParams, TPathParams> = (
  data: TRequestBody,
  mutateRequestOptions?: MutateRequestOptions<TQueryParams, TPathParams>,
) => Promise<TData>;

export interface UseMutateReturn<TData, TError, TRequestBody, TQueryParams, TPathParams>
extends MutateState<TData, TError> {
/**
 * Cancel the current fetch
 */
cancel: () => void;
/**
 * Call the mutate endpoint
 */
mutate: MutateMethod<TData, TRequestBody, TQueryParams, TPathParams>;
}

export type UseGenericGetProps = Omit<UseGetProps<any, any, any>, 'path'>;

declare type RefetchOptions<TData, TQueryParams, TPathParams> = Partial<
  Omit<UseGetProps<TData, TQueryParams, TPathParams>, 'lazy'>
>;

export interface IDataFetcher<TData = any, TError = any, TQueryParams = any, TPathParams = any> {
  loading: boolean;
  refetch: (options?: RefetchOptions<TData, TQueryParams, TPathParams>) => Promise<TData | null>;
  error: GetDataError<TError> | null;
  data: TData | null;
}

export interface IDataMutator<TData = any, TRequestBody = any, TQueryParams = any, TError = any, TPathParams = any>
  extends Pick<
    UseMutateReturn<TData, TError, TRequestBody, TQueryParams, TPathParams>,
    'mutate' | 'loading' | 'error'
  > {}
