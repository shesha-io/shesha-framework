import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import { Alert, Button, Tooltip } from 'antd';
import React, { FC } from 'react';
import { useStyles } from './styles/styles';

export interface IComponentErrorProps {
  errors?: IModelValidation;
  resetErrorBoundary?: (...args: Array<unknown>) => void;
  type?: ISheshaErrorTypes;
  message?: string;
}
const ComponentError: FC<IComponentErrorProps> = ({
  errors,
  resetErrorBoundary,
  type = 'warning',
  message,
}) => {
  const { styles } = useStyles();

  const errorTip = (errors: IModelValidation): JSX.Element => <ul>{errors.errors.map((error, index) => <li key={index}>{error.error}</li>)}</ul>;

  const tooltipClassName = type === 'info'
    ? styles.componentErrorInfo
    : type === 'warning'
      ? styles.componentErrorWaring
      : type === 'error'
        ? styles.componentErrorError
        : '';

  const alertClassName = type === 'info'
    ? styles.componentErrorTextInfo
    : type === 'warning'
      ? styles.componentErrorTextWaring
      : type === 'error'
        ? styles.componentErrorTextError
        : '';

  const componentLabel = errors?.componentType ?? 'Component';
  const messageText =
    message ??
    (type === 'info'
      ? `'${componentLabel}' Hint:`
      : `'${componentLabel}' has configuration issue(s)`);

  const body = (
    <Alert
      className={alertClassName}
      type={type}
      message={<strong>{messageText}</strong>}
      action={Boolean(resetErrorBoundary) && <Button type="link" onClick={resetErrorBoundary}>Try again</Button>}
      showIcon={true}
    />
  );

  return errors?.errors?.length > 0
    ? <Tooltip overlayClassName={tooltipClassName} title={errorTip(errors)}>{body}</Tooltip>
    : body;
};

export default ComponentError;
