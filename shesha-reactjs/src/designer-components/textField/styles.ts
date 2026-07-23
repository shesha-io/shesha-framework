import { createStyles } from '@/styles';
import { ITextFieldComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, token }, model: ITextFieldComponentProps) => {
  const textField = cx('sha-textField', css`
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${paddingStyles(model.stylingBoxJson)}
      ${dimensionsStyles(model.dimensions)}

      .ant-input {
        ${fontStyles(model.font)}
      }

      :hover {
        border-color: ${token.colorPrimary} !important;
      }
  `);

  const passwordFieldWrapper = cx('sha-password-field-wrapper', css`
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
