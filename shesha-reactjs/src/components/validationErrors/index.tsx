import React, { FC, Fragment } from 'react';
import { Alert, AlertProps } from 'antd';
import classNames from 'classnames';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { IAjaxResponseBase, IAjaxErrorResponse } from '@/interfaces/ajaxResponse';
import { useStyles } from './styles/styles';
import { AxiosResponse } from 'axios';
import { ErrorIconPopover } from '@/components/componentErrors/errorIconPopover';
import { extractErrorInfo, IModelValidation } from '@/utils/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export interface IValidationErrorsProps extends AlertProps {
  error: string | IErrorInfo | IAjaxErrorResponse | AxiosResponse<IAjaxResponseBase> | Error | unknown;
  renderMode?: 'alert' | 'raw' | 'popover';
  defaultMessage?: string | undefined;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  children?: React.ReactNode;
}

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
  const parsedError = extractErrorInfo(error);
  if (!parsedError) return null;

  const renderValidationErrors = (props: AlertProps): React.JSX.Element => {
    const widthStyle = isDefined(props.style) && props.style.width && props.style.marginLeft && props.style.marginRight
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
        {props.title}
        {props.description && (
          <>
            <br />
            {props.description}
          </>
        )}
      </Fragment>
    );
  };

  // Render using ErrorIconPopover mode
  if (renderMode === 'popover') {
    const errors: Array<{ propertyName?: string; error: string }> = [];

    if (parsedError.validationErrors?.length) {
      parsedError.validationErrors.forEach((ve) => {
        const memberName = Array.isArray(ve.members)
          ? ve.members.join(', ')
          : ve.members || 'Validation Error';
        errors.push({
          propertyName: memberName,
          error: ve.message || 'Validation error occurred',
        });
      });
    } else if (parsedError.details) {
      errors.push({
        propertyName: parsedError.message ?? defaultMessage,
        error: typeof parsedError.details === 'string' ? parsedError.details : 'See details',
      });
    } else {
      errors.push({
        propertyName: 'Error',
        error: parsedError.message ?? defaultMessage,
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
    return renderValidationErrors({ title: parsedError.message ?? defaultMessage, description: violations, ...rest });
  }

  if (!isNullOrWhiteSpace(parsedError.details) && parsedError.details !== parsedError.message) {
    return renderValidationErrors({ title: parsedError.message ?? defaultMessage, description: parsedError.details, ...rest });
  }

  return renderValidationErrors({ title: parsedError.message ?? defaultMessage, ...rest });
};

export default ValidationErrors;
