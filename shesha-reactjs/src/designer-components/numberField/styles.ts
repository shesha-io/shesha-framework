import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { fontWeight, fontFamily, textAlign }) => {
  const numberField = cx(
    'sha-ant-input-number-input',
    css`
      .ant-input-number-input {
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
