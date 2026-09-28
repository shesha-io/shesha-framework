/**
 * ABP-style response envelope shared with the Shesha React frontend.
 * The app reads `{ success, result }` on success and `{ success, error }`
 * (plus a matching HTTP status code) on failure.
 */

export interface IValidationErrorInfo {
  message: string;
  members?: string[];
}

export interface IErrorInfo {
  code?: number;
  message?: string;
  details?: string;
  data?: unknown;
  validationErrors?: IValidationErrorInfo[];
}

export interface IAjaxSuccessResponse<T> {
  success: true;
  result: T;
  targetUrl?: string | null;
  unAuthorizedRequest?: boolean;
  __abp: boolean;
}

export interface IAjaxErrorResponse {
  success: false;
  error: IErrorInfo;
  targetUrl?: string | null;
  unAuthorizedRequest?: boolean;
  __abp: boolean;
}

export type IAjaxResponse<T> = IAjaxSuccessResponse<T> | IAjaxErrorResponse;

export const success = <T>(result: T, targetUrl: string | null = null): IAjaxSuccessResponse<T> => ({
  success: true,
  result,
  targetUrl,
  unAuthorizedRequest: false,
  __abp: true,
});

export const failure = (
  error: IErrorInfo,
  opts: { unAuthorizedRequest?: boolean; targetUrl?: string | null } = {},
): IAjaxErrorResponse => ({
  success: false,
  error,
  targetUrl: opts.targetUrl ?? null,
  unAuthorizedRequest: opts.unAuthorizedRequest ?? false,
  __abp: true,
});

/** An error that carries the HTTP status code and ABP error body to return. */
export class GatewayError extends Error {
  readonly status: number;
  readonly code?: number;
  readonly details?: string;
  readonly unAuthorizedRequest: boolean;
  readonly validationErrors?: IValidationErrorInfo[];

  constructor(
    status: number,
    message: string,
    opts: {
      code?: number;
      details?: string;
      unAuthorizedRequest?: boolean;
      validationErrors?: IValidationErrorInfo[];
    } = {},
  ) {
    super(message);
    this.name = 'GatewayError';
    this.status = status;
    this.code = opts.code;
    this.details = opts.details;
    this.unAuthorizedRequest = opts.unAuthorizedRequest ?? status === 401;
    this.validationErrors = opts.validationErrors;
  }

  toAjax(): IAjaxErrorResponse {
    return failure(
      {
        code: this.code,
        message: this.message,
        details: this.details,
        validationErrors: this.validationErrors,
      },
      { unAuthorizedRequest: this.unAuthorizedRequest },
    );
  }
}

export const badRequest = (message: string, details?: string): GatewayError =>
  new GatewayError(400, message, { details });
export const unauthorized = (message = 'You are not authenticated'): GatewayError =>
  new GatewayError(401, message, { unAuthorizedRequest: true });
export const forbidden = (message = 'You are not authorized'): GatewayError =>
  new GatewayError(403, message, { unAuthorizedRequest: true });
export const notFound = (message: string): GatewayError => new GatewayError(404, message);
