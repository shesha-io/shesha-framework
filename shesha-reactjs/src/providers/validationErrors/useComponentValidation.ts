import { useEffect, useMemo } from 'react';
import { IModelValidation } from '@/utils/errors';
import { useValidationErrorsActions } from './index';

/**
 * Hook for components to register validation errors with the parent FormComponent
 *
 * This hook automatically registers and unregisters validation errors when the component
 * mounts/unmounts or when validation results change.
 *
 * The hook exposes the validation registration actions from ValidationErrorsProvider,
 * making the data flow explicit: components get the actions object and can use it
 * to register their validation errors.
 *
 * @param componentId - Unique identifier for the component
 * @param componentName - Name of the component
 * @param componentType - Type of the component
 * @param validationFn - Function that returns validation result or undefined if no errors
 * @param deps - Dependencies array for the validation function
 *
 * @example
 * ```tsx
 * const MyComponent = ({ model }) => {
 *   const store = useDataTableStore(false);
 *
 *   useComponentValidation(
 *     model.id,
 *     model.componentName,
 *     'datatable.filter',
 *     () => {
 *       if (!store) {
 *         return {
 *           hasErrors: true,
 *           validationType: 'error',
 *           errors: [{
 *             propertyName: 'Missing Required Parent Component',
 *             error: 'CONFIGURATION ERROR: Component MUST be placed inside a Data Context.',
 *           }],
 *         };
 *       }
 *       return undefined;
 *     },
 *     [store]
 *   );
 *
 *   // Component will automatically show validation error in FormComponent
 *   return <div>My Component Content</div>;
 * };
 * ```
 */
export const useComponentValidation = (
  componentId: string,
  componentName: string,
  componentType: string,
  validationFn: () => Partial<IModelValidation> | undefined,
  deps: unknown[],
): IModelValidation | undefined => {
  // Get the validation actions from the provider
  const validationActions = useValidationErrorsActions();
  const { registerValidation, unregisterValidation } = validationActions;

  const validationResult = useMemo((): IModelValidation | undefined => {
    const partialResult = validationFn();

    if (!partialResult || !partialResult.hasErrors) {
      return undefined;
    }

    return {
      ...partialResult,
      componentId,
      componentName,
      componentType,
      hasErrors: true,
    };
  }, [componentId, componentName, componentType, ...deps]); // eslint-disable-next-line react-hooks/exhaustive-deps -- deps provided explicitly by caller

  useEffect(() => {
    // Register validation errors using the actions from the provider
    if (validationResult) {
      registerValidation(componentId, validationResult);
    } else {
      // Clear errors if validation passes
      unregisterValidation(componentId);
    }

    // Cleanup on unmount
    return () => {
      unregisterValidation(componentId);
    };
  }, [componentId, validationResult, registerValidation, unregisterValidation]);

  return validationResult;
};
