import { useEffect, useMemo } from 'react';
import { IModelValidation } from '@/utils/errors';
import { useValidationErrorsActions, useValidationErrorsState } from './index';

/**
 * Hook for components to register validation errors with the parent FormComponent
 *
 * This hook automatically registers and unregisters validation errors when the component
 * mounts/unmounts or when validation results change.
 *
 * The component identity (id, name, type) is automatically obtained from the nearest
 * FormComponentValidationProvider, so you don't need to pass these values.
 *
 * @param validationFn - Function that returns validation result or undefined if no errors
 * @param deps - Dependencies array for the validation function
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const store = useDataTableStore(false);
 *
 *   useComponentValidation(
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
  validationFn: () => Partial<IModelValidation> | undefined,
  deps: unknown[],
): IModelValidation | undefined => {
  // Get component identity from the provider context
  const { componentId, componentName, componentType } = useValidationErrorsState();

  // Get the validation actions from the provider
  const { registerValidation, unregisterValidation } = useValidationErrorsActions();

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
  }, [componentId, componentName, componentType, validationFn, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps -- deps provided explicitly by caller

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
