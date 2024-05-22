import React, { FC, Fragment } from 'react';
import { Alert, AlertProps } from 'antd';
import { IErrorInfo, isErrorInfo, isHasErrorInfo } from '@/interfaces/errorInfo';
import { IAjaxResponseBase, isAjaxResponseBase, isAxiosResponse } from '@/interfaces/ajaxResponse';
import { useStyles } from './styles/styles';
import { AxiosResponse } from 'axios';

export interface IValidationErrorsProps {
  error: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error;
  renderMode?: 'alert' | 'raw';
  defaultMessage?: string;
}

const DEFAULT_ERROR_MSG = 'Sorry, an error has occurred. Please try again later';

/**
 * A component for displaying validation errors
 */
export const ValidationErrors: FC<IValidationErrorsProps> = ({ error, renderMode = 'alert', defaultMessage = 'Please correct the errors and try again:' }) => {
  const { styles } = useStyles();
  if (!error) return null;

  const renderValidationErrors = (props: AlertProps) => {

    if (renderMode === 'alert') {
      return <Alert className={styles.shaValidationErrorAlert} type="error" showIcon closable {...props} />;
    }

    return (
      <Fragment>
        {props?.message}
        {props?.description && (
          <>
            <br />
            {props.description}
          </>
        )}
      </Fragment>
    );
  };

  if (typeof error === 'string') {
    return renderValidationErrors({ message: error });
  }

  const errorObj = error instanceof Error
    ? { message: error.message } as IErrorInfo
    : isAxiosResponse(error) && isAjaxResponseBase(error.data)
      ? error.data.error
      : isAjaxResponseBase(error)
        ? error.error
        : isHasErrorInfo(error)
          ? error.errorInfo
          : isErrorInfo(error)
            ? error
            : undefined;

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
