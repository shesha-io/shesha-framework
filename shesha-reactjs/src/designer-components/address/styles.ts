import { createStyles } from '@/styles';
import { IAddressCompomentProps } from './models';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: IAddressCompomentProps) => {
  // Border, background and shadow are what antd repaints in the interactive and validation
  // states, so they are kept together and re-asserted wherever antd would override them.
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const boxStyles = `
    ${dimensionsStyles(model.dimensions)}
    ${marginStyles(model.stylingBoxJson)}
    ${paddingStyles(model.stylingBoxJson)}
  `;

  const address = cx('sha-address', css`
      ${configuredAppearance}
      ${boxStyles}
      ${fontStyles(model.font)}

      /* antd repaints the background on :hover (hoverBg), :focus/:focus-within (activeBg) and
         on the error/warning statuses — the latter with the \`background\` shorthand, which also
         wipes a configured image or gradient. Re-assert the configured appearance at higher
         specificity so these states only affect what they should. */
      &&&&:hover,
      &&&&:focus,
      &&&&:focus-within,
      &&&&[class*="-status-error"],
      &&&&[class*="-status-warning"] {
        ${configuredAppearance}
      }

      /* The control renders an antd Input with both \`allowClear\` and a prefix icon, so it is
         always wrapped in an affix wrapper and the wrapper — not the inner input — owns the
         visible border and background. The class lands on the wrapper; style it, then neutralise
         the inner input so the two never both paint (margin and padding included, or the
         configured spacing is applied twice). */
      &[class*="-input-affix-wrapper"] {
        ${configuredAppearance}
        ${boxStyles}

        &&&& input.${prefixCls}-input,
        &&&& input.${prefixCls}-input:hover,
        &&&& input.${prefixCls}-input:focus,
        &&&& input.${prefixCls}-input:focus-within {
          background: transparent;
          border: none;
          box-shadow: none;
          margin: 0;
          padding: 0;
          height: 100%;
          ${fontStyles(model.font)}
        }
      }

      input.${prefixCls}-input {
        ${fontStyles(model.font)}
      }
  `);

  return {
    address,
  };
});
