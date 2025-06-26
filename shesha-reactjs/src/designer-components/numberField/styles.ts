import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign, color, fontSize }) => {
  const numberField = cx(
    'sha-ant-input-number-input',
    css`

    
      .ant-input-number-input {
        --ant-color-text: ${color} !important;
        --ant-font-size: ${fontSize} !important;
        font-weight: ${fontWeight} !important;
        font-family: ${fontFamily};
        text-align: ${textAlign};
      }
    `
  );
  return {
    numberField,
  };
});
