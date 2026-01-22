import React, { FC, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { IModelValidation } from '@/utils/errors';
import { createNamedContext } from '@/utils/react';
import { isEqual } from 'lodash';

export interface IComponentValidationError extends IModelValidation {
  componentId: string;
}

export interface IValidationErrorsStateContext {
  errors: Map<string, IComponentValidationError>;
  componentId: string;
  componentName: string;
  componentType: string;
}

export interface IValidationErrorsActionsContext {
  /**
   * Register or update validation errors for the component
   * @param validation - The validation result, or undefined to clear errors
   */
  registerValidation: (validation?: IModelValidation) => void;

  /**
   * Unregister validation errors for the component (cleanup on unmount)
   */
  unregisterValidation: () => void;

  /**
   * Get validation errors for the component
   */
  getValidation: () => IComponentValidationError | undefined;

  /**
   * Get all validation errors
   */
  getAllValidations: () => IComponentValidationError[];
}

const ValidationErrorsStateContext = createNamedContext<IValidationErrorsStateContext>(
  undefined,
  "ValidationErrorsStateContext",
);

const ValidationErrorsActionsContext = createNamedContext<IValidationErrorsActionsContext>(
  undefined,
  "ValidationErrorsActionsContext",
);

export interface IFormComponentValidationProviderProps {
  componentId: string;
  componentName: string;
  componentType: string;
}

/**
 * Provider that manages validation errors from child components within a FormComponent
 *
 * This provider should wrap each FormComponent to collect validation errors from its children.
 * The component identity (id, name, type) is provided once at the provider level, so child
 * components using useComponentValidation don't need to specify it repeatedly.
 */
export const FormComponentValidationProvider: FC<PropsWithChildren<IFormComponentValidationProviderProps>> = ({
  componentId,
  componentName,
  componentType,
  children,
}) => {
  const errorsRef = useRef<Map<string, IComponentValidationError>>(new Map());
  // State to trigger re-renders when errors change
  const [errorVersion, setErrorVersion] = useState(0);

  const registerValidation = useCallback((validation?: IModelValidation) => {
    const currentValidation = errorsRef.current.get(componentId);

    // Check if validation actually changed using deep equality
    let hasChanged = false;
    if (validation && validation.hasErrors) {
      // Ensure componentId is included in the stored validation
      const componentValidation: IComponentValidationError = {
        ...validation,
        componentId,
      };
      hasChanged = !isEqual(currentValidation, componentValidation);
      if (hasChanged) {
        errorsRef.current.set(componentId, componentValidation);
      }
    } else {
      // Clear validation if no errors
      hasChanged = errorsRef.current.has(componentId);
      if (hasChanged) {
        errorsRef.current.delete(componentId);
      }
    }

    // Only trigger re-render if something actually changed
    if (hasChanged) {
      setErrorVersion((v) => v + 1);
    }
  }, [componentId]);

  const unregisterValidation = useCallback(() => {
    if (errorsRef.current.has(componentId)) {
      errorsRef.current.delete(componentId);
      // Only trigger re-render if we actually deleted something
      setErrorVersion((v) => v + 1);
    }
  }, [componentId]);

  const getValidation = useCallback((): IComponentValidationError | undefined => {
    return errorsRef.current.get(componentId);
  }, [componentId]);

  const getAllValidations = useCallback((): IComponentValidationError[] => {
    return Array.from(errorsRef.current.values());
  }, []);

  const stateValue = useMemo<IValidationErrorsStateContext>(
    () => ({
      errors: errorsRef.current,
      componentId,
      componentName,
      componentType,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errorVersion, componentId, componentName, componentType], // errorVersion triggers re-render when errors change
  );

  const actionsValue = useMemo<IValidationErrorsActionsContext>(
    () => ({
      registerValidation,
      unregisterValidation,
      getValidation,
      getAllValidations,
    }),
    [registerValidation, unregisterValidation, getValidation, getAllValidations],
  );

  return (
    <ValidationErrorsStateContext.Provider value={stateValue}>
      <ValidationErrorsActionsContext.Provider value={actionsValue}>
        {children}
      </ValidationErrorsActionsContext.Provider>
    </ValidationErrorsStateContext.Provider>
  );
};

/**
 * Hook to access validation errors state
 */
export const useValidationErrorsState = (): IValidationErrorsStateContext => {
  const context = useContext(ValidationErrorsStateContext);
  if (context === undefined) {
    throw new Error('useValidationErrorsState must be used within a ValidationErrorsProvider');
  }
  return context;
};

/**
 * Hook to access validation errors actions
 */
export const useValidationErrorsActions = (): IValidationErrorsActionsContext => {
  const context = useContext(ValidationErrorsActionsContext);
  if (context === undefined) {
    throw new Error('useValidationErrorsActions must be used within a ValidationErrorsProvider');
  }
  return context;
};

/**
 * Combined hook to access both state and actions
 */
export const useValidationErrors = (): IValidationErrorsStateContext & IValidationErrorsActionsContext => {
  return {
    ...useValidationErrorsState(),
    ...useValidationErrorsActions(),
  };
};

// Backward compatibility: export with old name
export const ValidationErrorsProvider = FormComponentValidationProvider;

// Export the component validation hook
export { useComponentValidation } from './useComponentValidation';
