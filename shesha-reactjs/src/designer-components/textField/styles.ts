import { createStyles } from '@/styles';

type StylesArgs = {
  fontWeight: string | undefined;
  fontFamily: string | undefined;
  textAlign: string | undefined;
  color: string | undefined;
  fontSize: number | undefined;
};
type StylesResponse = {
  textField: string;
  passwordFieldWrapper: string;
};

export const useStyles = createStyles<StylesArgs, StylesResponse>(({ css, cx, token }, { fontWeight, fontFamily, textAlign, color, fontSize }) => {
  const textField = cx("sha-textField", css`
        .ant-input {
            ${color ? `--ant-color-text: ${color} !important;` : ''};
            ${fontSize ? `--ant-font-size: ${fontSize} !important;` : ''};
            ${fontWeight ? `font-weight: ${fontWeight};` : ''};
            ${fontFamily ? `font-family: ${fontFamily};` : ''};
            ${textAlign ? `text-align: ${textAlign};` : ''};
        }

        :hover {
            border-color: ${token.colorPrimary} !important;
        }
  `);

  const passwordFieldWrapper = cx("sha-password-field-wrapper", css`
    .ant-form-item-explain,
    .ant-form-item-explain-connected {
      max-width: var(--sha-password-input-width, 100%);
      overflow: hidden;
    }

    .ant-form-item-explain-error {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: default;
    }
  `);

  return {
    textField,
    passwordFieldWrapper,
  };
});
