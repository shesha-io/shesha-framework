import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx, token }, { style }: { style: CSSProperties }) => {

  const dropdown = cx("sha-dropdown", css`
    --ant-color-text: ${style.color} !important;
    --ant-font-size: ${style.fontSize} !important;
    --ant-font-weight-strong: ${style.fontWeight} !important;
    --ant-select-multiple-item-bg: transparent !important;

    .ant-select-selector{
        overflow: auto;
        scrollbar-width: thin;
        ::-webkit-scrollbar {
            width: 8px;
            background-color: transparent;
        }
    }
  
    .ant-select-selection-item {
      font-weight: var(--ant-font-weight) !important;
      --ant-line-width: 0px !important;

      height: 100%;

      .ant-select-selection-item-content {
        display: flex;
      }

      :hover {
        border: none !important;
        .ant-tag {  
          align-content: center;
          cursor: default !important;
          pointer-events: none !important;  
        }
      }
    }

    &.ant-select-open, &:hover {
      border-color: ${token.colorPrimary} !important;
    }
  `);

  return {
    dropdown
  };
});