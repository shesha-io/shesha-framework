import { IModelValidation } from "@/utils/errors";

export const validationError = (componentName: string): IModelValidation => ({
  hasErrors: true,
  validationType: 'error' as const,
  errors: [{
    propertyName: 'Missing Required Parent Component',
    error: `CONFIGURATION ERROR: ${componentName} MUST be placed inside a Data Context component. This component cannot function without a data source.`,
  }],
});
