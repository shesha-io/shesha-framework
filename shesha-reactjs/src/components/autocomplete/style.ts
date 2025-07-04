import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx, token }, { style }: { style: CSSProperties }) => {

  const autocomplete = cx("sha-autocomplete", css`
    --ant-color-text: ${style?.color} !important;
    --ant-font-size: ${style?.fontSize} !important;
    --ant-font-weight-strong: ${style?.fontWeight} !important;

    .ant-select-selection-item {
      font-weight: var(--ant-font-weight) !important;
    }

    &.ant-select-open, &:hover {
      border-color: ${token.colorPrimary} !important;
    }
  `);

  const loadingSpinner = cx("sha-autocomplete-loading", css`
    display: flex;
    align-items: center;
    min-height: 32px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    padding: 4px 11px;
    background-color: ${token.colorBgContainer};
    font-size: ${style?.fontSize || token.fontSize}px;
    font-family: ${style?.fontFamily || token.fontFamily};
    color: ${style?.color || token.colorText};
    
    &:hover {
      border-color: ${token.colorPrimaryHover};
    }
  `);

  const loadingText = cx("sha-autocomplete-loading-text", css`
    margin-left: 8px;
    color: ${token.colorTextSecondary};
  `);

  return {
    autocomplete,
    loadingSpinner,
    loadingText
  };
});