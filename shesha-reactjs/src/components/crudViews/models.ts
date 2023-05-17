import { GetDataError, UseGetProps } from 'hooks/restful/get';
import { UseMutateReturn } from 'hooks/restful/mutate';

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
