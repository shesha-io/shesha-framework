import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import { Button } from 'antd';
import React, { FC } from 'react';
import ErrorIconPopover from './errorIconPopover';
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

  const componentLabel = errors?.componentType ?? 'Component';
  const messageText =
    message ??
    (type === 'info'
      ? `'${componentLabel}' Hint:`
      : `'${componentLabel}' has configuration issue(s)`);

  const containerClassName = type === 'info'
    ? styles.componentErrorTextInfo
    : type === 'warning'
      ? styles.componentErrorTextWaring
      : type === 'error'
        ? styles.componentErrorTextError
        : '';

  const content = (
    <div className={`${styles.componentErrorContainer} ${containerClassName}`}>
      <div className={styles.componentErrorHeader}>
        <strong className={styles.componentErrorMessage}>{messageText}</strong>
        {Boolean(resetErrorBoundary) && (
          <Button type="link" onClick={resetErrorBoundary} className={styles.componentErrorButton}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );

  return errors ? (
    <ErrorIconPopover
      mode="validation"
      validationResult={errors}
      type={type}
      position="top-right"
    >
      {content}
    </ErrorIconPopover>
  ) : message ? (
    <ErrorIconPopover
      mode="message"
      message={message}
      type={type}
      position="top-right"
    >
      {content}
    </ErrorIconPopover>
  ) : (
    content
  );
};

export default ComponentError;
