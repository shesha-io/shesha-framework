import { createStyles } from '@/styles';
import { isDefined } from '@/utils/nullables';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx, token }, { style }: { style: CSSProperties }) => {
  // Only emit the theme overrides the caller actually supplied. The designer component now styles
  // the control through its own Appearance class and passes no computed `style`, so emitting these
  // unconditionally would produce `undefined` declarations that shadow that class.
  const dropdown = cx("sha-dropdown", css`
    ${isDefined(style.color) ? `--ant-color-text: ${style.color} !important;` : ''}
    ${isDefined(style.fontWeight) ? `--ant-font-weight-strong: ${style.fontWeight} !important;` : ''}
    --ant-select-multiple-item-bg: transparent !important;

    .ant-select-selector {
        ${style.height !== 'auto' ? 'overflow-y: auto;' : ''}
        .ant-select-selection-overflow {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            height: 100%;
            ${isDefined(style.textAlign) ? `justify-content: ${style.textAlign};` : ''}
        }

        scrollbar-width: thin;
        ::-webkit-scrollbar {
            width: 8px;
            background-color: transparent;
        }
    }

    input {
      ${isDefined(style.fontSize) ? `font-size: ${style.fontSize} !important;` : ''}
    }

    .ant-tag {
      margin: 0;
      align-content: center;
      display: inline-flex;
      align-items: center;
      overflow: hidden;
      ${isDefined(style.textAlign) ? `justify-content: ${style.textAlign};` : ''}
    }
  
    .ant-select-selection-item {
      ${isDefined(style.fontSize) ? `font-size: ${style.fontSize} !important;` : ''}
      font-weight: var(--ant-font-weight) !important;
      --ant-line-width: 0px !important;
      line-height: unset !important;
      overflow: visible;
      height: 100%;
      display: flex;
      align-items: center;
      ${isDefined(style.textAlign) ? `justify-content: ${style.textAlign};` : ''}

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
    dropdown,
  };
});
