import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { style }) => {
  const dropdown = cx(
    'sha-ant-input-select-input',
    css`
      .ant-select-selection-item {
        font-weight: ${style.fontWeight} !important;
        font-family: ${style.fontFamily};
        text-align: ${style.textAlign};
      }
    `
  );
  return {
    dropdown,
  };
});
