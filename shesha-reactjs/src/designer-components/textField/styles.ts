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
      ${fontStyles(model.font)}

      .ant-input {
        ${fontStyles(model.font)}
      }

      :hover {
        border-color: ${token.colorPrimary} !important;
      }

      /* antd repaints the field's background in several states: \`hoverBg\` on :hover,
         \`activeBg\` on :focus/:focus-within, and the \`background\` shorthand on the
         error/warning statuses (which also wipes a configured image or gradient).
         Re-assert the configured background at higher specificity in all of them, so these
         states only affect the border and never the background the user configured. */
      &&&&:hover,
      &&&&:focus,
      &&&&:focus-within,
      &&&&[class*="-status-error"],
      &&&&[class*="-status-warning"] {
        ${backgroundStyles(model.background)}
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
