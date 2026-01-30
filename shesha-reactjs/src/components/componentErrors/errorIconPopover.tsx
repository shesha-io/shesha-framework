import React, { FC, PropsWithChildren } from 'react';
import { InfoCircleFilled } from '@ant-design/icons';
import { Popover } from 'antd';
import { IModelValidation, ISheshaErrorTypes } from '@/utils/errors';
import { useStyles } from './styles/errorIconPopoverStyles';
import componentDocs from './component-docs.json';

interface IErrorIconPopoverBaseProps extends PropsWithChildren {
  type?: ISheshaErrorTypes;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title?: string | null;
  isDesignerMode?: boolean;
}

interface IErrorIconPopoverWithValidation extends IErrorIconPopoverBaseProps {
  mode: 'validation';
  validationResult: IModelValidation;
  message?: never;
}

interface IErrorIconPopoverWithMessage extends IErrorIconPopoverBaseProps {
  mode: 'message';
  validationResult?: never;
  message: string;
}

export type IErrorIconPopoverProps = IErrorIconPopoverWithValidation | IErrorIconPopoverWithMessage;

export const ErrorIconPopover: FC<IErrorIconPopoverProps> = (props) => {
  const { children, mode, type, position = 'top-right', title, isDesignerMode = false } = props;
  const { styles } = useStyles({ isDesignerMode });

  const getIcon = (): React.ReactElement => {
    // Always use filled info icon with hard-coded orange-yellowish warning color
    return <InfoCircleFilled style={{ color: '#faad14', fontSize: '16px' }} />;
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

  const renderPopover = (content: React.ReactElement, popoverTitle: string | null, effectiveType: ISheshaErrorTypes): React.ReactElement => {
    const iconWrapperClass = [
      styles.iconWrapper,
      getPositionClass(),
      effectiveType === 'info' && 'sha-info-icon-wrapper',
    ].filter(Boolean).join(' ');

    return (
      <div className={styles.errorIconContainer}>
        {children}
        <Popover
          content={<div className={styles.popoverWrapper}>{content}</div>}
          title={popoverTitle}
          trigger={["hover", "click"]}
          placement="leftTop"
          color="rgb(214, 214, 214)"
        >
          <div
            className={iconWrapperClass}
            role="img"
            aria-label={`${effectiveType} indicator`}
          >
            {getIcon()}
          </div>
        </Popover>
      </div>
    );
  };

  // Use discriminator to narrow the type and access the correct properties
  if (mode === 'validation') {
    const { validationResult } = props;

    // Use validationType from validationResult if available, otherwise fall back to type prop or 'warning'
    const effectiveType = validationResult.validationType ?? type ?? 'warning';

    const componentType = validationResult.componentType;
    const docUrl = componentType && componentType in componentDocs
      ? componentDocs[componentType as keyof typeof componentDocs]
      : undefined;

    const getPopoverContent = (): React.ReactElement => {
      if (validationResult.hasErrors && validationResult.errors?.length > 0) {
        return (
          <>
            {validationResult.errors.map((error, index) => {
              // Split error message by newlines to support multiline messages
              const errorParts = error.error?.split('\n') || [];
              return (
                <p key={index} style={{ margin: 0, marginBottom: index < validationResult.errors.length - 1 ? '4px' : 0 }}>
                  {error.propertyName && <strong>{error.propertyName}: </strong>}
                  {errorParts.map((part, partIndex) => (
                    <React.Fragment key={partIndex}>
                      {partIndex > 0 && <br />}
                      {part}
                    </React.Fragment>
                  ))}
                </p>
              );
            })}
            {docUrl && (
              <>
                <br />
                <a href={docUrl} target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
              </>
            )}
          </>
        );
      }

      // Fallback case: hasErrors is true but errors array is empty/undefined
      // This shouldn't normally occur but provides a safe default
      return (
        <>
          <p style={{ margin: 0, fontWeight: 600 }}>Component Error</p>
          {docUrl && (
            <>
              <br />
              <a href={docUrl} target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
            </>
          )}
        </>
      );
    };

    const hasError = validationResult.hasErrors;

    // If no error, just render children without wrapper
    if (!hasError) {
      return <>{children}</>;
    }

    // Determine the popover title
    const popoverTitle = title !== undefined ? title : (effectiveType === 'info' ? 'Hint:' : `'${validationResult.componentType}' has configuration issue(s)`);

    return renderPopover(getPopoverContent(), popoverTitle, effectiveType);
  } else {
    // mode === 'message'
    const { message } = props;

    const effectiveType = type ?? 'warning';

    const getPopoverContent = (): React.ReactElement => {
      return <p style={{ margin: 0, fontWeight: 600 }}>{message || 'Component Error'}</p>;
    };

    // Determine the popover title
    const popoverTitle = title !== undefined ? title : (effectiveType === 'info' ? 'Hint:' : 'Configuration issue');

    return renderPopover(getPopoverContent(), popoverTitle, effectiveType);
  }
};

export default ErrorIconPopover;
