import { IErrorInfo, IValidationErrorInfo } from "@/interfaces";

export class ConfigurationLoadingError extends Error implements IErrorInfo {
  code: number | null;

  constructor(message?: string, code?: number, options?: ErrorOptions) {
    super(message || "Failed to load configuration", options);

    this.name = 'ConfigurationLoadingError';
    this.code = code ?? null;

    Error.captureStackTrace(this, ConfigurationLoadingError);
  }

  details?: string | null;

  validationErrors?: IValidationErrorInfo[] | null;
}
