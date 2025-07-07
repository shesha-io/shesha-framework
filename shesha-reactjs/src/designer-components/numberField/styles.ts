import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign, color, fontSize, hasSuffix, hasPrefix, padding }) => {
  const numberField = cx(
    'sha-input-number-input',
    css`
      // display: flex;
      // flex-direction: row;
      // align-items: center;
      // justify-content: normal;
      padding-inline-start: unset !important;

      .ant-input-number-input {
        --ant-color-text: ${color} !important;
        --ant-font-size: ${fontSize} !important;
        font-size: ${addPx(fontSize)} !important;
        font-weight: ${fontWeight} !important;
        font-family: ${fontFamily};
        text-align: ${textAlign};
        padding-right: ${padding?.paddingRight};
        padding-left: ${padding?.paddingLeft};
        padding-top: ${padding?.paddingTop};
        padding-bottom: ${padding?.paddingBottom};
        padding: ${padding?.padding};
      }

      .ant-input-number-handler-wrap {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        --ant-color-text-description: ${color} !important;
        background-color: transparent;
        z-index: 1;
      }

      .ant-input-number-suffix {
        margin-inline-end: unset !important;
        margin-left: 8px;
        position: relative;
        ${!hasSuffix && 'display: none;'}
      }

      .ant-input-number-prefix {
        margin-inline-end: unset !important;
        margin-right: 8px;
        position: relative !important;
        ${!hasPrefix && 'display: none;'}   
      }
`
  );
  return {
    numberField,
  };
});
