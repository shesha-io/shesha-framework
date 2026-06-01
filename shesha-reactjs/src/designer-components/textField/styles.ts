import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, { fontWeight, fontFamily, textAlign, color, fontSize }) => {
  const textField = cx("sha-textField", css`
        .ant-input {
            --ant-color-text: ${color} !important;
            --ant-font-size: ${fontSize} !important;
            font-weight: ${fontWeight};
            font-family: ${fontFamily};
            text-align: ${textAlign};
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
