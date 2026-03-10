import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, { isDesignerMode = false }: { isDesignerMode?: boolean }) => {
  const errorIconContainer = cx("sha-error-icon-container", css`
    position: relative;
    ${isDesignerMode ? 'display: block; width: 100%;' : 'display: contents;'}
  `);

  const iconWrapper = cx("sha-error-icon-wrapper", css`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    background-color: transparent;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: ${isDesignerMode ? '100' : '10'};
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    }
  `);

  const iconTopRight = cx("sha-error-icon-top-right", css`
    top: ${isDesignerMode ? '28px' : '4px'};
    right: 6px;

    &:hover {
      transform: scale(1.1);
    }
  `);

  const iconTopLeft = cx("sha-error-icon-top-left", css`
    top: 4px;
    left: 4px;

    &:hover {
      transform: scale(1.1);
    }
  `);

  const iconBottomRight = cx("sha-error-icon-bottom-right", css`
    bottom: 4px;
    right: 4px;
  `);

  const iconBottomLeft = cx("sha-error-icon-bottom-left", css`
    bottom: 4px;
    left: 4px;
  `);

  const errorIcon = cx("sha-error-icon", css`
    font-size: 16px;
    color: ${token.colorError};
  `);

  const warningIcon = cx("sha-warning-icon", css`
    font-size: 16px;
    color: ${token.colorWarning};
  `);

  const infoIcon = cx("sha-info-icon", css`
    font-size: 16px;
    color: ${token.colorInfo};
  `);

  const popoverWrapper = cx("sha-error-popover-wrapper", css`
    padding: 4px 8px;
  `);

  const popoverContent = cx("sha-error-popover-content", css`
    max-width: 300px;
  `);

  const popoverTitle = cx("sha-error-popover-title", css`
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: ${token.colorText};
  `);

  const errorList = cx("sha-error-list", css`
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 4px;
      font-size: 13px;
      color: ${token.colorTextSecondary};
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }

      strong {
        color: ${token.colorText};
        font-weight: 600;
      }
    }
  `);

  return {
    errorIconContainer,
    iconWrapper,
    iconTopRight,
    iconTopLeft,
    iconBottomRight,
    iconBottomLeft,
    errorIcon,
    warningIcon,
    infoIcon,
    popoverWrapper,
    popoverContent,
    popoverTitle,
    errorList,
  };
});
