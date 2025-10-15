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

  const errortip = (errors: IModelValidation): JSX.Element => <ul>{errors.errors.map((error, index) => <li key={index}>{error.error}</li>)}</ul>;

  const tooltipClassName = type === 'info'
    ? styles.cmoponentErrorInfo
    : type === 'warning'
      ? styles.cmoponentErrorWaring
      : type === 'error'
        ? styles.cmoponentErrorError
        : '';

  const alertClassName = type === 'info'
    ? styles.cmoponentErrorTextInfo
    : type === 'warning'
      ? styles.cmoponentErrorTextWaring
      : type === 'error'
        ? styles.cmoponentErrorTextError
        : '';

  const messageText = !message
    ? `'${errors.componentType}' has configuration issue(s)`
    : message;

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
    ? <Tooltip overlayClassName={tooltipClassName} title={errortip(errors)}>{body}</Tooltip>
    : body;
};

export default ComponentError;
