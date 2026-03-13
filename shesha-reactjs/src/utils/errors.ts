import { IErrorInfo, isAjaxErrorResponse, isErrorInfo, isHasErrorInfo } from "@/interfaces";
import { isDefined } from "./nullables";
import axios from "axios";
import { isAxiosResponse } from "@/interfaces/ajaxResponse";

export type ISheshaErrorTypes = 'info' | 'warning' | 'error';

export interface IModelError {
  propertyName?: string;
  error: string;
}

export interface IModelValidation {
  componentId?: string;
  componentName?: string;
  componentType?: string;
  hasErrors: boolean;
  errors?: IModelError[];
  validationType?: ISheshaErrorTypes;
}

export interface ISheshaErrorCause {
  type?: ISheshaErrorTypes | undefined;
  errors?: IModelValidation | undefined;
}

/**
 * Shesha Error class
 */
export class SheshaError extends Error {
  public override cause?: ISheshaErrorCause;

  constructor(message: string, errors?: IModelValidation | undefined, type?: ISheshaErrorTypes | undefined) {
    super(message);
    this.name = 'SheshaError';
    this.cause = { type, errors };
  }

  /** Check if the Error object is a SheshaError */
  static isSheshaError(error: Error): error is SheshaError {
    return error instanceof SheshaError;
  }

  /** Throw a SheshaError with model property error */
  static throwPropertyError(propertyName: string, error: string | null | undefined = null): void {
    throw new SheshaError('', { hasErrors: true, errors: [{ propertyName, error: error || `Please make sure the '${propertyName}' property is configured properly.` }] }, 'warning');
  }

  /** Throw a SheshaError with model errors */
  static throwModelErrors(errors: IModelValidation): void {
    throw new SheshaError('', errors, 'warning');
  }

  /** Throw a SheshaError with message */
  static throwError(message: string): void {
    throw new SheshaError(message, undefined, 'error');
  }

  /** Add model error, used in model validation function */
  static addModelError(errors: IModelValidation, propertyName: string, error: string): void {
    if (!errors.errors)
      errors.errors = [];
    errors.errors.push({ propertyName, error });
  }
}

export const throwError = (message: string): never => {
  throw new Error(message);
};

export const extractErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export const extractErrorInfo = (error: unknown): IErrorInfo | undefined => {
  if (!isDefined(error))
    return undefined;

  if (typeof error === 'string') {
    return { message: error };
  }

  if (error instanceof Error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as unknown;

      if (isAjaxErrorResponse(responseData))
        return { message: responseData.error.message ?? "Unknown error", details: responseData.error.details ?? null } satisfies IErrorInfo;
    }

    return { message: error.message };
  } else {
    return isAxiosResponse(error) && isAjaxErrorResponse(error.data)
      ? error.data.error
      : isAjaxErrorResponse(error)
        ? error.error
        : isHasErrorInfo(error)
          ? error.errorInfo
          : isErrorInfo(error)
            ? error
            : undefined;
  }
};

export const makeErrorWithMessage = (error: unknown, message: string): IErrorInfo => {
  const errorInfo = extractErrorInfo(error) ?? { };
  return {
    ...errorInfo,
    message,
  };
};
