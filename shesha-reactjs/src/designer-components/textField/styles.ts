import { createStyles } from '@/styles';
import { ITextFieldComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, token }, model: ITextFieldComponentProps) => {
  // Dimensions, margin and padding are applied to the actual <input> element (`.ant-input`) rather
  // than the affix wrapper, so the sizing/spacing the user configures acts on the input itself.
  // TextField always renders prefix/suffix, so antd always wraps the input in `.ant-input-affix-wrapper`
  // and `.ant-input` is reliably present as a descendant.
  const inputElementStyles = `
    ${dimensionsStyles(model.dimensions)}
    ${marginStyles(model.stylingBoxJson)}
    ${paddingStyles(model.stylingBoxJson)}
    ${fontStyles(model.font)}
  `;

  const textField = cx('sha-textField', css`
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${fontStyles(model.font)}

      .ant-input {
        ${inputElementStyles}
      }

      /* When the field is rendered without an affix wrapper the class lands on the bare input,
         so apply the same input-level styles to the element itself. */
      &.ant-input {
        ${inputElementStyles}
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
