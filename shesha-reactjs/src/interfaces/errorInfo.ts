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

export const isErrorInfo = (value: any): value is IErrorInfo => {
  const typed = value as IErrorInfo;
  return value && typeof(value) === 'object'
    //&& typed.code !== undefined
    && typed.message !== undefined; 
};

export const isHasErrorInfo = (value: any): value is IHasErrorInfo => {
  const typed = value as IHasErrorInfo;
  return value && typeof(value) === 'object'
    && isErrorInfo(typed.errorInfo);
};