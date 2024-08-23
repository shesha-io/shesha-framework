import { createStyles } from '@/styles';
import { getTextHoverEffects } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const textFieldInput = cx("text-field", css`
        * {
          font-weight: inherit !important;
          text-align: inherit !important;
          :hover {
            border-color: ${token.colorPrimary} !important;
            color: ${getTextHoverEffects(token)} !important;
          }
        }
  `);

  return {
    textFieldInput
  };
});