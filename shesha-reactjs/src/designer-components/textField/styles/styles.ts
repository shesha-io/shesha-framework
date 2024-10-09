import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const textFieldInput = cx("text-field", css`
        * {
          font-weight: inherit !important;
          text-align: inherit !important;
          :hover {
            border-color: ${token.colorPrimary} !important;
          }
        }
  `);

  return {
    textFieldInput
  };
});