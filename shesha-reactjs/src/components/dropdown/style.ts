import { createStyles } from '@/styles';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx, token }, { style }: { style: CSSProperties }) => {

  const dropdown = cx("sha-dropdown", css`
    --ant-color-text: ${style.color} !important;
    --ant-font-weight-strong: ${style.fontWeight} !important;
    --ant-select-multiple-item-bg: transparent !important;

    .ant-select-selector {
        ${(style.height !== 'auto' || !style.height) && 'overflow-y: auto;'}
        .ant-select-selection-overflow {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            height: 100%;
            justify-content: ${style.textAlign};
        }

        scrollbar-width: thin;
        ::-webkit-scrollbar {
            width: 8px;
            background-color: transparent;
        }
    }

    input {
      font-size: ${style.fontSize} !important;
    }

    .ant-tag {
      margin: 0;
      align-content: center;
      display: inline-flex;
      align-items: center;
      overflow: hidden;
      justify-content: ${style.textAlign};
    }
  
    .ant-select-selection-item {
      font-size: ${style.fontSize} !important;
      font-weight: var(--ant-font-weight) !important;
      --ant-line-width: 0px !important;
      line-height: unset !important;
      overflow: visible;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: ${style.textAlign};

      .ant-select-selection-item-content {
        display: flex;
        overflow: visible;
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