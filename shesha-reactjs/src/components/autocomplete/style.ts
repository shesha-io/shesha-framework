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

  return {
    autocomplete
  };
});