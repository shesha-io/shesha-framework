import { createStyles } from '@/styles';
import { addPx } from '@/utils/style';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign, color, fontSize, hasSuffix }) => {
  const numberField = cx(
    'sha-ant-input-number-input',
    css`
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: normal;

      .ant-input-number-input {
        --ant-color-text: ${color} !important;
        --ant-font-size: ${fontSize} !important;
        font-size: ${addPx(fontSize)} !important;
        font-weight: ${fontWeight} !important;
        font-family: ${fontFamily};
        text-align: ${textAlign};
      }

      .ant-input-number-handler-wrap {
        background-color: transparent;
        border: 
      }

      .ant-input-number-suffix {
        position: relative;
        ${!hasSuffix && 'display: none;'}
      }
`
  );
  return {
    numberField,
  };
});
