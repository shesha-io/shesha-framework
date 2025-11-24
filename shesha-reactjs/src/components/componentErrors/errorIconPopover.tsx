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
  type,
  message,
  position = 'top-right',
  title,
}) => {
  const { styles } = useStyles();

  // Use validationType from validationResult if available, otherwise fall back to type prop or 'warning'
  const effectiveType = validationResult?.validationType ?? type ?? 'warning';

  const getIcon = (): React.ReactElement => {
    switch (effectiveType) {
      case 'error':
        return <ExclamationCircleOutlined className={styles.errorIcon} />;
      case 'info':
        return <InfoCircleOutlined className={styles.infoIcon} />;
      default:
        return <WarningOutlined className={styles.warningIcon} />;
    }
  };

  const getPopoverContent = (): React.ReactElement => {
    const componentType = validationResult?.componentType;
    const docUrl = componentType && componentType in componentDocs
      ? componentDocs[componentType as keyof typeof componentDocs]
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
  const popoverTitle = title !== undefined ? title : (effectiveType === 'info' ? 'Hint:' : `'${validationResult?.componentType}' has configuration issue(s)`);

  return (
    <div className={styles.errorIconContainer}>
      {children}
      <Popover
        content={<div className={styles.popoverWrapper}>{getPopoverContent()}</div>}
        title={popoverTitle}
        trigger={["hover", "click"]}
        placement="leftTop"
        color="rgb(214, 214, 214)"
      >
        <div
          className={`${styles.iconWrapper} ${getPositionClass()}`}
          role="img"
          aria-label={`${effectiveType} indicator`}
        >
          {getIcon()}
        </div>
      </Popover>
    </div>
  );
};

export default ErrorIconPopover;
