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