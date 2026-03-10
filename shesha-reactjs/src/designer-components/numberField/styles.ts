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
        padding-left: ${hasPrefix ? '4px' : '8px'} !important;
        padding-right: ${hasSuffix ? '4px' : '8px'} !important;
        padding-bottom: 5px !important;
      }

      

      .ant-input-number {
        height: 100%;
        align-items: center;
        ${hasSuffix && 'display: grid;'}
        ${hasSuffix && 'grid-template-columns: minmax(0, 1fr) auto auto;'}

        &:hover {
          ${!hasSuffix && 'padding-right: 28px !important;'}
          transition: padding-right 0.2s ease;
        }
      }
      .ant-input-number-handler-wrap {
        ${hasSuffix && 'border-inline-end: 1px solid #d9d9d9 !important;'}
        border-start-end-radius: 0px !important;
        border-end-end-radius: 0px !important;
        ${hasSuffix && 'grid-column: 2;'}
        ${hasSuffix && 'grid-row: 1;'}
        ${hasSuffix && 'position: static;'}

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
        margin-right: 4px !important;
        position: relative;
        padding: 4px;

        .anticon {
          margin-left: 4px !important;
          color: ${color} !important;
        }
      }

      .ant-input-number-prefix {
        ${!hasPrefix && 'display: none;'}   
        margin-inline-end: 0px !important;
        margin-left: 8px !important ;
        position: relative !important;
        padding: 4px 0px;

        .anticon {
          margin-right: 4px !important;
          color: ${color} !important;
        }
      }
`,
  );
  return {
    numberField,
  };
});
