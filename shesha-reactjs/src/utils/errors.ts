
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
}

export interface ISheshaErrorCause {
  type?: ISheshaErrorTypes;
  errors?: IModelValidation;
}

/**
 * Shesha Error class
 */
export class SheshaError extends Error {
  public cause?: ISheshaErrorCause;

  constructor(message: string, errors?: IModelValidation, type?: ISheshaErrorTypes) {
    super(message);
    this.name = 'SheshaError';
    this.cause = { type, errors };
  }

  /** Check if the Error object is a SheshaError */
  static isSheshaError(error: Error): error is SheshaError {
    return error instanceof SheshaError;
  }

  /** Throw a SheshaError with model property error */
  static throwPropertyError(propertyName: string, error: string = null): void {
    throw new SheshaError('', { hasErrors: true, errors: [{ propertyName, error: error || `Please make sure the '${propertyName}' property is configured properly.` }] }, 'warning');
  }

  /** Throw a SheshaError with model errors */
  static throwModelErrors(errors: IModelValidation): void {
    throw new SheshaError('', errors, 'warning');
  }

  /** Throw a SheshaError with message */
  static throwError(message: string): void {
    throw new SheshaError(message, null, 'error');
  }

  /** Add model error, used in model validation function */
  static addModelError(errors: IModelValidation, propertyName: string, error: string): void {
    errors.errors.push({ propertyName, error });
  }
}
