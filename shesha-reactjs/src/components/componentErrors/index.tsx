import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import React, { FC } from 'react';
import ErrorIconPopover from './errorIconPopover';

export interface IComponentErrorProps {
  errors?: IModelValidation;
  resetErrorBoundary?: (...args: Array<unknown>) => void;
  type?: ISheshaErrorTypes;
  message?: string;
  children?: React.ReactNode;
}

const ComponentError: FC<IComponentErrorProps> = ({
  errors,
  type = 'warning',
  message,
  children,
}) => {
  // If children are provided, wrap them with ErrorIconPopover
  // Otherwise, just show the ErrorIconPopover without any component content
  // This ensures we always render the component (or nothing) with an error icon overlay

  if (!children) {
    // No component to render - just return null
    // The error boundary will handle showing error details if needed
    return null;
  }

  // Component exists - wrap it with the error icon
  if (errors) {
    return (
      <ErrorIconPopover
        mode="validation"
        validationResult={errors}
        type={type}
        position="top-right"
      >
        {children}
      </ErrorIconPopover>
    );
  }

  if (message) {
    return (
      <ErrorIconPopover
        mode="message"
        message={message}
        type={type}
        position="top-right"
      >
        {children}
      </ErrorIconPopover>
    );
  }

  // No errors or message - just return the children
  return <>{children}</>;
};

export default ComponentError;
