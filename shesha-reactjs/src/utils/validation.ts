import { ValidationNodeRef } from '@/interfaces';
import { AsyncValidationError } from '@rc-component/async-validator/lib/util';
import { isNullOrWhiteSpace } from './nullables';
import { ReactNode } from 'react';
import { EnhancedValidateError } from '..';
import { ValidateError } from '@rc-component/async-validator';

export const isAsyncValidationError = (error: unknown): error is AsyncValidationError => {
  return error instanceof AsyncValidationError ||
    // note: `error instanceof AsyncValidationError` may not work
    (error instanceof Error &&
      "errors" in error && Array.isArray(error.errors) &&
      "fields" in error && typeof error.fields === 'object' &&
      error.fields !== null);
};

const getFullPath = (path: ValidationNodeRef[], field: string | undefined): string => {
  const fullPath = path.map((e) => e.name);
  return !isNullOrWhiteSpace(field)
    ? [...fullPath, field].join('.')
    : fullPath.join('.');
};
export class ComponentValidationError extends Error {
  path: ValidationNodeRef[];

  field: string;

  fieldLabel?: string | ReactNode | undefined;

  constructor(message: string, path: ValidationNodeRef[], field: string | undefined, fieldLabel?: string | ReactNode | undefined) {
    super(message);
    this.path = path;
    this.field = getFullPath(path, field);
    this.fieldLabel = fieldLabel;
    this.name = 'ComponentValidationError';
  }

  static wrap(error: ValidateError | ComponentValidationError, path: ValidationNodeRef[]): ComponentValidationError {
    if (error instanceof ComponentValidationError)
      return error;

    const enhancedError = error as EnhancedValidateError;
    return new ComponentValidationError(error.message ?? "Unknown error", enhancedError.path ?? path, error.field, enhancedError.fieldLabel);
  }
}

export const collectValidationErrors = async (validator: () => Promise<void>, path: ValidationNodeRef[], mainErrors: Error[]): Promise<void> => {
  const tryAddError = (error: unknown): void => {
    if (isAsyncValidationError(error)) {
      error.errors.forEach((nestedError) => {
        if (nestedError instanceof ComponentValidationError) {
          mainErrors.push(nestedError);
        } else {
          const enhancedError = nestedError as EnhancedValidateError;
          mainErrors.push(new ComponentValidationError(nestedError.message ?? "Unknown error", path, nestedError.field, enhancedError.fieldLabel));
        }
      });
    } else
      if (error instanceof Error)
        mainErrors.push(error);
  };
  try {
    await validator();
  } catch (error: unknown) {
    if (Array.isArray(error)) {
      error.forEach((e) => tryAddError(e));
    } else
      tryAddError(error);
  }
};

export const unwrapErrors = (srcError: unknown, path: ValidationNodeRef[]): Error[] => {
  const result: Error[] = [];

  const tryAddError = (error: unknown): void => {
    if (isAsyncValidationError(error)) {
      error.errors.forEach((nestedError) => {
        result.push(ComponentValidationError.wrap(nestedError, path));
      });
    } else
      if (error instanceof Error)
        result.push(error);
  };
  if (Array.isArray(srcError)) {
    srcError.forEach((e) => tryAddError(e));
  } else
    tryAddError(srcError);
  return result;
};
