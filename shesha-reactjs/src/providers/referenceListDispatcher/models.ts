export interface ILoadingState<TData> {
  data: TData | undefined;
  error?: unknown;
  loading: boolean;
}

export const extractErrorMessage = (error: unknown): string | undefined => {
  return error instanceof Error
    ? error.message
    : undefined;
};
