import { IModelValidation } from "@/utils/errors";
import { IErrorInfo, IValidationErrorInfo } from "@/interfaces/errorInfo";
import { isAjaxErrorResponse, isAxiosResponse, IAjaxErrorResponse } from "@/interfaces/ajaxResponse";
import axios, { AxiosError } from "axios";

/**
 * Type guard to check if an error is an AxiosError with response data
 */
const isAxiosErrorWithResponse = (error: unknown): error is AxiosError<IAjaxErrorResponse> => {
  return axios.isAxiosError(error) && error.response !== undefined;
};

export const validationError = (componentName: string): IModelValidation => ({
  hasErrors: true,
  validationType: 'error' as const,
  errors: [{
    propertyName: 'Missing Required Parent Component',
    error: `CONFIGURATION ERROR: ${componentName} MUST be placed inside a Data Context component.\nThis component cannot function without a data source.`,
  }],
});

/**
 * Parse fetch errors from the data source into validation error format
 * Handles Axios responses, ABP error format, and generic errors
 */
export const parseFetchError = (error: unknown): Array<{ propertyName: string; error: string }> => {
  if (!error) return [];

  // Extract error info - handle Axios error structure
  let errorInfo: IErrorInfo | undefined;

  // Check for AxiosError with response.data.error (ABP format)
  if (isAxiosErrorWithResponse(error)) {
    if (isAjaxErrorResponse(error.response.data)) {
      errorInfo = error.response.data.error;
    }
  }

  // Fallback to existing type guards if not found
  if (!errorInfo) {
    errorInfo = isAxiosResponse(error) && isAjaxErrorResponse(error.data)
      ? error.data.error
      : isAjaxErrorResponse(error)
        ? error.error
        : error instanceof Error
          ? { message: error.message }
          : typeof error === 'string'
            ? { message: error }
            : undefined;
  }

  if (!errorInfo) {
    return [{
      propertyName: 'Data Fetch Error',
      error: 'An unknown error occurred while fetching data',
    }];
  }

  const errors: Array<{ propertyName: string; error: string }> = [];

  // Add validation errors (field-specific messages)
  if (errorInfo.validationErrors && Array.isArray(errorInfo.validationErrors)) {
    errorInfo.validationErrors.forEach((ve: IValidationErrorInfo) => {
      const message = ve.message || 'Validation error';
      let propertyName = 'Field Error';

      if (ve.members) {
        if (Array.isArray(ve.members) && ve.members.length > 0) {
          propertyName = ve.members[0];
        } else if (typeof ve.members === 'string') {
          propertyName = ve.members;
        }
      }

      errors.push({
        propertyName,
        error: message,
      });
    });
  }

  // Only add main message if we don't have validation errors
  if (errors.length === 0 && errorInfo.message) {
    errors.push({
      propertyName: 'Data Fetch Error',
      error: errorInfo.message,
    });
  }

  // Add details if present and helpful
  if (errors.length === 1 && errorInfo.details && errorInfo.details !== errorInfo.message) {
    errors.push({
      propertyName: 'Details',
      error: errorInfo.details,
    });
  }

  return errors.length > 0 ? errors : [{
    propertyName: 'Data Fetch Error',
    error: 'An error occurred while fetching data',
  }];
};
