import React, { FC, PropsWithChildren } from 'react';
import { ExclamationCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import { useStyles } from './styles/errorIconPopoverStyles';
import componentDocs from './component-docs.json';

interface IErrorIconPopoverBaseProps extends PropsWithChildren {
  type?: ISheshaErrorTypes;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title?: string | null;
}

interface IErrorIconPopoverWithValidation extends IErrorIconPopoverBaseProps {
  validationResult: IModelValidation;
  message?: string;
}

interface IErrorIconPopoverWithMessage extends IErrorIconPopoverBaseProps {
  validationResult?: IModelValidation;
  message: string;
}

export type IErrorIconPopoverProps = IErrorIconPopoverWithValidation | IErrorIconPopoverWithMessage;

export const ErrorIconPopover: FC<IErrorIconPopoverProps> = ({
  children,
  validationResult,
  type = 'warning',
  message,
  position = 'top-right',
  title,
}) => {
  const { styles, cx } = useStyles();

  const getIcon = (): React.ReactElement => {
    switch (type) {
      case 'error':
        return <ExclamationCircleOutlined className={cx(styles.errorIcon)} />;
      case 'info':
        return <InfoCircleOutlined className={cx(styles.infoIcon)} />;
      default:
        return <WarningOutlined className={cx(styles.warningIcon)} />;
    }
  };

  const getPopoverContent = (): React.ReactElement => {
    const docUrl = validationResult?.componentType && validationResult.componentType in componentDocs
      ? componentDocs[validationResult.componentType as keyof typeof componentDocs]
      : undefined;
    if (validationResult?.hasErrors && validationResult.errors?.length > 0) {
      return (
        <>
          {validationResult.errors.map((error, index) => (
            <p key={index} style={{ margin: 0, marginBottom: index < validationResult.errors.length - 1 ? '4px' : 0 }}>
              {error.propertyName && <strong>{error.propertyName}: </strong>}
              {error.error}
            </p>
          ))}
          {docUrl && (
            <>
              <br />
              <a href={docUrl} target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
            </>
          )}
        </>
      );
    }

    return (
      <>
        <p style={{ margin: 0, fontWeight: 600 }}>{message || 'Component Error'}</p>
        {docUrl && (
          <>
            <br />
            <a href={docUrl} target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
          </>
        )}
      </>
    );
  };

  const getPositionClass = (): string => {
    switch (position) {
      case 'top-left':
        return styles.iconTopLeft;
      case 'top-right':
        return styles.iconTopRight;
      case 'bottom-left':
        return styles.iconBottomLeft;
      case 'bottom-right':
        return styles.iconBottomRight;
      default:
        return styles.iconTopRight;
    }
  };

  const hasError = validationResult?.hasErrors || message;

  // If no error, just render children without wrapper
  if (!hasError) {
    return <>{children}</>;
  }

  // Determine the popover title
  const popoverTitle = title !== undefined ? title : (type === 'info' ? 'Hint:' : `'${validationResult?.componentType}' has configuration issue(s)`);

  return (
    <div className={cx(styles.errorIconContainer)}>
      {children}
      <Popover
        content={<div className={cx(styles.popoverWrapper)}>{getPopoverContent()}</div>}
        title={popoverTitle}
        trigger={["hover", "click"]}
        placement="leftTop"
        color="rgb(214, 214, 214)"
      >
        <div
          className={cx(styles.iconWrapper, getPositionClass())}
          role="img"
          aria-label={`${type} indicator`}
        >
          {getIcon()}
        </div>
      </Popover>
    </div>
  );
};

export default ErrorIconPopover;
