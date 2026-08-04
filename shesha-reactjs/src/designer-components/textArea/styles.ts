import { createStyles } from '@/styles';
import { ITextAreaComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, marginStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx }, model: ITextAreaComponentProps) => {
  // antd repaints the field's background/border in several states: `hoverBg` on :hover,
  // `activeBg` on :focus/:focus-within, and the `background` shorthand on the error/warning
  // statuses (which also wipes a configured image or gradient). Re-assert the configured
  // appearance in all of them so these states only affect what the user did not configure.
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}

  `;

  const statefulAppearance = `
    &&&&:hover,
    &&&&:focus,
    &&&&:focus-within,
    &&&&[class*="-status-error"],
    &&&&[class*="-status-warning"] {
      ${configuredAppearance}
    }
  `;

  const textArea = cx('sha-text-area', css`
      ${configuredAppearance}
      ${paddingStyles(model.stylingBoxJson)}
      ${dimensionsStyles(model.dimensions)}
      ${fontStyles(model.font)}
      ${marginStyles(model.stylingBoxJson)}

      ${statefulAppearance}
  `);

  /**
   * With `allowClear` (or a count) antd wraps the textarea in an affix wrapper, and that
   * wrapper — not the inner <textarea> — then carries the visible border, background and
   * shadow. Styling only the inner element makes the configured appearance disappear as
   * soon as Allow Clear is enabled, so the wrapper is styled to match.
   */
  // `root` is applied to the affix wrapper only when one exists; without allowClear it lands
  // on the <textarea> itself. Every rule here is therefore scoped to the wrapper class antd
  // adds, so a plain textarea is left entirely to `textArea` above.
  const textAreaWrapper = cx('sha-text-area-wrapper', css`
      &[class*="-textarea-affix-wrapper"] {
        ${configuredAppearance}
        ${paddingStyles(model.stylingBoxJson)}
        ${dimensionsStyles(model.dimensions)}
        ${marginStyles(model.stylingBoxJson)}

        ${statefulAppearance}

        /* The inner textarea still carries the textArea class, so its own copy of the
           appearance is neutralised here — the wrapper owns it now. Only the font is left,
           since that belongs on the element rendering the text. */
        textarea.ant-input {
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
          width: 100%;
          height: 100%;
          min-height: 0;
          max-height: none;
        }
      }
  `);

  return {
    textArea,
    textAreaWrapper,
  };
});
