import { GetDataError, UseGetProps, UseMutateReturn } from 'restful-react';

export type UseGenericGetProps = Omit<UseGetProps<any, any, any, any>, 'path'>;

declare type RefetchOptions<TData, TError, TQueryParams, TPathParams> = Partial<
  Omit<UseGetProps<TData, TError, TQueryParams, TPathParams>, 'lazy'>
>;

export interface IDataFetcher<TData = any, TError = any, TQueryParams = any, TPathParams = any> {
  loading: boolean;
  refetch: (options?: RefetchOptions<TData, TError, TQueryParams, TPathParams>) => Promise<TData | null>;
  error: GetDataError<TError> | null;
  data: TData | null;
}

export interface IDataMutator<TData = any, TRequestBody = any, TQueryParams = any, TError = any, TPathParams = any>
  extends Pick<
    UseMutateReturn<TData, TError, TRequestBody, TQueryParams, TPathParams>,
    'mutate' | 'loading' | 'error'
  > {}
