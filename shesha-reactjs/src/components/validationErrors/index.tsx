import React, { FC, Fragment } from 'react';
import { Alert, AlertProps } from 'antd';
import classNames from 'classnames';
import { IErrorInfo, isErrorInfo, isHasErrorInfo } from '@/interfaces/errorInfo';
import { IAjaxResponseBase, isAjaxResponseBase, isAxiosResponse } from '@/interfaces/ajaxResponse';
import { useStyles } from './styles/styles';
import { AxiosResponse } from 'axios';

export interface IValidationErrorsProps extends AlertProps {
  error: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error;
  renderMode?: 'alert' | 'raw';
  defaultMessage?: string;
}

const DEFAULT_ERROR_MSG = 'Sorry, an error has occurred. Please try again later';

/**
 * A component for displaying validation errors
 */
export const ValidationErrors: FC<IValidationErrorsProps> = ({
  error,
  renderMode = 'alert',
  defaultMessage = 'Please correct the errors and try again:',
  className,
  ...rest
}) => {
  const { styles } = useStyles();
  if (!error) return null;

  const renderValidationErrors = (props: AlertProps) => {
    const widthStyle = props.style?.width && props.style?.marginLeft && props.style?.marginRight
      ? {
        width: `calc(${props.style.width} - (${props.style.marginLeft} + ${props.style.marginRight}))`,
        maxWidth: `calc(${props.style.width} - (${props.style.marginLeft} + ${props.style.marginRight}))`,
        minWidth: `calc(${props.style.width} - (${props.style.marginLeft} + ${props.style.marginRight}))`
      }
      : {};

    if (renderMode === 'alert') {
      return (
        <Alert
          className={classNames(styles.shaValidationErrorAlert, className)}
          type="error"
          showIcon
          closable
          {...props}
          style={{ ...props.style, ...widthStyle }}
        />
      );
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
    return renderValidationErrors({ message: error, ...rest });
  }

  const errorObj =
    error instanceof Error
      ? ({ message: error.message } as IErrorInfo)
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
    const violations = <ul>{validationErrors?.map((e, i) => <li key={i}>{e.message}</li>)}</ul>;

    return renderValidationErrors({ message: defaultMessage, description: violations, ...rest });
  }

  if (message) {
    return renderValidationErrors({ message, ...rest });
  }

  if (details) {
    return renderValidationErrors({ message: details, ...rest });
  }

  return renderValidationErrors({ message: DEFAULT_ERROR_MSG, ...rest });
};

export default ValidationErrors;
