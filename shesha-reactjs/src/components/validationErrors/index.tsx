import React, { FC, Fragment } from 'react';
import { Alert, AlertProps } from 'antd';
import { IErrorInfo } from '../../interfaces/errorInfo';
import { IAjaxResponseBase } from '../../interfaces/ajaxResponse';

export interface IValidationErrorsProps {
  error: string | IErrorInfo | IAjaxResponseBase;
  renderMode?: 'alert' | 'raw';
  defaultMessage?: string;
}

const DEFAULT_ERROR_MSG = 'Sorry, an error has occurred. Please try again later';

/**
 * A component for displaying validation errors
 */
export const ValidationErrors: FC<IValidationErrorsProps> = ({ error, renderMode = 'alert', defaultMessage = 'Please correct the errors and try again:' }) => {
  if (!error) return null;

  const renderValidationErrors = (props: AlertProps) => {
    if (renderMode === 'alert') {
      return <Alert className="sha-validation-error-alert" type="error" showIcon closable {...props} />;
    }

    return (
      <Fragment>
        {props?.message}
        {props?.description && (
          <>
            <br/>
            {props.description}
          </>
        )}
      </Fragment>
    );
  };

  let errorObj = error as IErrorInfo;

  if (typeof error === 'string') {
    return renderValidationErrors({ message: error });
  }

  if (Object.keys(error).includes('error')) {
    errorObj = error['error'] as IErrorInfo;
  }

  if (Object.keys(error).includes('errorInfo') && Object.keys(error['errorInfo']).includes('error')) {
    errorObj = error['errorInfo']['error'] as IErrorInfo;
  }

  // IAjaxResponseBase
  if (Object.keys(error).includes('data')) {
    errorObj = error['data']['error'] as IErrorInfo;
  }

  const { message, details, validationErrors } = errorObj || {};

  if (validationErrors?.length) {
    const violations = (
      <ul>
        {validationErrors?.map((e, i) => (
          <li key={i}>{e.message}</li>
        ))}
      </ul>
    );

    return renderValidationErrors({ message: defaultMessage, description: violations });
  }

  if (message) {
    return renderValidationErrors({ message });
  }

  if (details) {
    return renderValidationErrors({ message: details });
  }

  return renderValidationErrors({ message: DEFAULT_ERROR_MSG });
};

export default ValidationErrors;
