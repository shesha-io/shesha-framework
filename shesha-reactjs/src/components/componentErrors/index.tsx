import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import React, { FC } from 'react';
import ErrorIconPopover from './errorIconPopover';

export interface IComponentErrorProps {
  errors?: IModelValidation;
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
  // Show error icon if there are validation errors
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

  // Show error icon if there's an error message
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

  // No errors or message - just return the children (or null if no children)
  return children ? <>{children}</> : null;
};

export default ComponentError;
