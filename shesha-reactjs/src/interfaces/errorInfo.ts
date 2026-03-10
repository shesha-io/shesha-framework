export interface IValidationErrorInfo {
  message?: string | null;
  members?: string | string[] | null;
}

export interface IErrorInfo {
  code?: number | null;
  message?: string | null;
  details?: string | null;
  validationErrors?: IValidationErrorInfo[] | null;
}

export interface IHasErrorInfo {
  errorInfo: IErrorInfo;
}

export const isErrorInfo = (value: unknown): value is IErrorInfo => {
  const typed = value as IErrorInfo;
  return value && typeof (value) === 'object' &&
    // && typed.code !== undefined
    typed.message !== undefined;
};

export const isHasErrorInfo = (value: unknown): value is IHasErrorInfo => {
  const typed = value as IHasErrorInfo;
  return value && typeof (value) === 'object' &&
    isErrorInfo(typed.errorInfo);
};

export const toErrorInfo = (error: unknown): IErrorInfo => {
  return error instanceof Error
    ? { message: error.message }
    : isErrorInfo(error)
      ? error
      : { message: "Unknown error" } satisfies IErrorInfo;
};
