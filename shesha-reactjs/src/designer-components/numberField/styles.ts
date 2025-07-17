import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign, color, fontSize, hasSuffix, hasPrefix, padding }) => {
  const numberField = cx(
    'sha-input-number-input',
    css`
      padding-inline-start: ${padding?.paddingLeft || '0px'} !important;
      overflow: hidden;

      .ant-input-number-input-wrap {
        height: 100% !important;
        overflow: hidden;
      }

      .ant-input-number-input {
        --ant-color-text: ${color} !important;
        --ant-font-size: ${fontSize} !important;
        font-size: ${addPx(fontSize)} !important;
        font-weight: ${fontWeight} !important;
        font-family: ${fontFamily};
        text-align: ${textAlign};
        height: 100% !important;
      }

      .ant-input-number {
        align-items: center;
      }

      .ant-input-number-handler-wrap {
        ${(hasSuffix || padding?.paddingRight) && 'border-inline-end: var(--ant-line-width) var(--ant-line-type) var(--ant-input-number-handle-border-color);'}
        border-start-end-radius: 0px !important;
        border-end-end-radius: 0px !important;

        .ant-input-number-handler-up {
          border-start-end-radius: 0px !important;
        }

        .ant-input-number-handler-down {
          border-end-end-radius: 0px !important;
        }
      }

      .ant-input-number-suffix {
        ${!hasSuffix && 'display: none;'}
        margin-inline-end: unset !important;
        margin-inline-start: 0px !important;
        margin-right: 8px !important;
        position: relative;

        .anticon {
          margin-left: 4px !important;
          color: ${color} !important;
        }
      }

      .ant-input-number-prefix {
        ${!hasPrefix && 'display: none;'}   
        margin-inline-end: 4px !important;
        margin-left: 8px !important ;
        position: relative !important;

        .anticon {
          margin-right: 4px !important;
          color: ${color} !important;
        }
      }
`
  );
  return {
    numberField,
  };
});
