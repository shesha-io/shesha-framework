import { createStyles } from '@/styles';

type StylesArgs = {
  fontWeight: string | undefined;
  fontFamily: string | undefined;
  textAlign: string | undefined;
};

type StylesResponse = {
  passwordCombo: string;
};

export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx }, { fontWeight, fontFamily, textAlign }) => {
  const passwordCombo = cx("sha-password-combo", css`
        .ant-input {
          ${fontWeight && `font-weight: ${fontWeight};`}
          ${fontFamily && `font-family: ${fontFamily};`}
          ${textAlign && `text-align: ${textAlign};`}
        }
  `);
  return {
    passwordCombo,
  };
});
