
export type ISheshaErrorTypes = 'info' | 'warning' | 'error';

export interface IModelError {
  propertyName?: string;
  error: string;
}

export interface IModelValidation {
  componentName?: string;
  componentType?: string;
  hasErrors: boolean;
  errors?: IModelError[];
}

export interface ISheshaErrorCause {
  type?: ISheshaErrorTypes;
  errors?: IModelValidation;
}

export class SheshaError extends Error {

  public cause?: ISheshaErrorCause;
  
  constructor(message: string, errors?: IModelValidation, type?: ISheshaErrorTypes) {
    super(message);
    this.name = 'SheshaError';
    this.cause = { type, errors };
  }

  static isSheshaError(error: Error): error is SheshaError {
    return error instanceof SheshaError;
  }

  static throwModelError(propertyName: string, error: string) {
    throw new SheshaError('', { hasErrors: true, errors: [{ propertyName, error }] }, 'warning');
  }

  static throwModelErrors(errors: IModelValidation) {
    throw new SheshaError('', errors, 'warning');
  }

  static throwError(message: string) {
    throw new SheshaError(message, null, 'error');
  }

  static addModelError(errors: IModelValidation, propertyName: string, error: string) {
    errors.errors.push({ propertyName, error });
  }
}
