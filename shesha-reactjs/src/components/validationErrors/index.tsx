import React, { FC, Fragment } from 'react';
import { Alert, AlertProps } from 'antd';
import classNames from 'classnames';
import { IErrorInfo, isErrorInfo, isHasErrorInfo } from '@/interfaces/errorInfo';
import { IAjaxResponseBase, isAxiosResponse, isAjaxErrorResponse, IAjaxErrorResponse } from '@/interfaces/ajaxResponse';
import { useStyles } from './styles/styles';
import { AxiosResponse } from 'axios';
import { ErrorIconPopover } from '@/components/componentErrors/errorIconPopover';
import { IModelValidation } from '@/utils/errors';

export interface IValidationErrorsProps extends AlertProps {
  error: string | IErrorInfo | IAjaxErrorResponse | AxiosResponse<IAjaxResponseBase> | Error | unknown;
  renderMode?: 'alert' | 'raw' | 'popover';
  defaultMessage?: string | undefined;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  children?: React.ReactNode;
}

const DEFAULT_ERROR_MSG = 'Sorry, an error has occurred. Please try again later';

/**
 * A component for displaying validation errors
 */
export const ValidationErrors: FC<IValidationErrorsProps> = ({
  error,
  renderMode = 'popover',
  defaultMessage = 'Please correct the errors and try again:',
  className,
  position = 'top-right',
  children,
  ...rest
}) => {
  const { styles } = useStyles();
  if (!error) return null;

  const renderValidationErrors = (props: AlertProps): JSX.Element => {
    const widthStyle = props.style?.width && props.style?.marginLeft && props.style?.marginRight
      ? {
        width: `calc(${props.style.width} - (${props.style.marginLeft} + ${props.style.marginRight}))`,
        maxWidth: `calc(${props.style.width} - (${props.style.marginLeft} + ${props.style.marginRight}))`,
        minWidth: `calc(${props.style.width} - (${props.style.marginLeft} + ${props.style.marginRight}))`,
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

  // Parse error into structured format
  const parseError = (): { message?: string; details?: string | React.ReactElement; validationErrors?: IErrorInfo['validationErrors'] } => {
    if (typeof error === 'string') {
      return { message: error };
    }

    const errorObj =
      error instanceof Error
        ? ({ message: error.message } as IErrorInfo)
        : isAxiosResponse(error) && isAjaxErrorResponse(error.data)
          ? error.data.error
          : isAjaxErrorResponse(error)
            ? error.error
            : isHasErrorInfo(error)
              ? error.errorInfo
              : isErrorInfo(error)
                ? error
                : undefined;

    const { message, details, validationErrors } = errorObj || {};

    return {
      message: message || undefined,
      details,
      validationErrors,
    };
  };

  const parsedError = parseError();

  // Render using ErrorIconPopover mode
  if (renderMode === 'popover') {
    const errors: Array<{ propertyName?: string; error: string }> = [];

    if (parsedError.validationErrors?.length) {
      parsedError.validationErrors.forEach((ve) => {
        errors.push({
          propertyName: ve.propertyName || 'Validation Error',
          error: ve.message || 'Validation error occurred',
        });
      });
    } else if (parsedError.details) {
      errors.push({
        propertyName: parsedError.message ?? defaultMessage ?? 'Error',
        error: typeof parsedError.details === 'string' ? parsedError.details : 'See details',
      });
    } else {
      errors.push({
        propertyName: 'Error',
        error: parsedError.message ?? defaultMessage ?? DEFAULT_ERROR_MSG,
      });
    }

    const validationResult: IModelValidation = {
      hasErrors: true,
      validationType: 'error',
      errors,
    };

    return (
      <ErrorIconPopover
        mode="validation"
        validationResult={validationResult}
        type="error"
        position={position}
        title="Error"
      >
        {children || <div style={{ display: 'inline-block' }} />}
      </ErrorIconPopover>
    );
  }

  // Legacy alert/raw modes
  if (parsedError.validationErrors?.length) {
    const violations = <ul>{parsedError.validationErrors.map((e, i) => <li key={i}>{e.message || 'Validation error'}</li>)}</ul>;
    return renderValidationErrors({ message: parsedError.message ?? defaultMessage ?? DEFAULT_ERROR_MSG, description: violations, ...rest });
  }

  if (parsedError.details) {
    return renderValidationErrors({ message: parsedError.message ?? defaultMessage ?? DEFAULT_ERROR_MSG, description: parsedError.details, ...rest });
  }

  return renderValidationErrors({ message: parsedError.message ?? defaultMessage ?? DEFAULT_ERROR_MSG, ...rest });
};

export default ValidationErrors;
