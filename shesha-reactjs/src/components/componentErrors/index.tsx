import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import React, { FC } from 'react';
import ErrorIconPopover from './errorIconPopover';

export interface IComponentErrorProps {
  errors?: IModelValidation;
  type?: ISheshaErrorTypes;
  message?: string;
}

const ComponentError: FC<IComponentErrorProps> = ({
  errors,
  type = 'warning',
  message,
}) => {
  // Show error icon if there are validation errors
  if (errors) {
    return (
      <ErrorIconPopover
        mode="validation"
        validationResult={errors}
        type={type}
        position="top-right"
      />
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
      />
    );
  }

  // No errors or message - return null
  return null;
};

export default ComponentError;
