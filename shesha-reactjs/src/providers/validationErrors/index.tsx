import React, { FC, PropsWithChildren, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { IModelValidation } from '@/utils/errors';
import { createNamedContext } from '@/utils/react';

export interface IComponentValidationError extends IModelValidation {
  componentId: string;
}

export interface IValidationErrorsStateContext {
  errors: Map<string, IComponentValidationError>;
}

export interface IValidationErrorsActionsContext {
  /**
   * Register or update validation errors for a component
   * @param componentId - The unique identifier of the component
   * @param validation - The validation result, or undefined to clear errors
   */
  registerValidation: (componentId: string, validation?: IModelValidation) => void;

  /**
   * Unregister validation errors for a component (cleanup on unmount)
   * @param componentId - The unique identifier of the component
   */
  unregisterValidation: (componentId: string) => void;

  /**
   * Get validation errors for a specific component
   * @param componentId - The unique identifier of the component
   */
  getValidation: (componentId: string) => IComponentValidationError | undefined;

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

export type IValidationErrorsProviderProps = unknown;

/**
 * Provider that manages validation errors from child components
 */
export const ValidationErrorsProvider: FC<PropsWithChildren<IValidationErrorsProviderProps>> = ({ children }) => {
  const errorsRef = useRef<Map<string, IComponentValidationError>>(new Map());
  // State to trigger re-renders when errors change
  const [errorVersion, setErrorVersion] = useState(0);

  const registerValidation = useCallback((componentId: string, validation?: IModelValidation) => {
    if (validation && validation.hasErrors) {
      errorsRef.current.set(componentId, { ...validation, componentId });
    } else {
      errorsRef.current.delete(componentId);
    }
    // Trigger re-render by incrementing version
    setErrorVersion((v) => v + 1);
  }, []);

  const unregisterValidation = useCallback((componentId: string) => {
    errorsRef.current.delete(componentId);
    // Trigger re-render by incrementing version
    setErrorVersion((v) => v + 1);
  }, []);

  const getValidation = useCallback((componentId: string): IComponentValidationError | undefined => {
    return errorsRef.current.get(componentId);
  }, []);

  const getAllValidations = useCallback((): IComponentValidationError[] => {
    return Array.from(errorsRef.current.values());
  }, []);

  const stateValue = useMemo<IValidationErrorsStateContext>(
    () => ({
      errors: errorsRef.current,
    }),
    [errorVersion], // Re-create state when errors change
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

// Export the component validation hook
export { useComponentValidation } from './useComponentValidation';
