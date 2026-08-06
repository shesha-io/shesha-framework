import { createStyles } from '@/styles';
import { ITextAreaComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx }, model: ITextAreaComponentProps) => {
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const textArea = cx('sha-text-area', css`
      ${configuredAppearance}
      ${paddingStyles(model.stylingBoxJson)}
      ${dimensionsStyles(model.dimensions)}
      ${fontStyles(model.font)}

      /* The antd reset sets font-size to inherit, so the inner element needs the font restated at a
         specificity that beats it. */
      &&&& {
        ${fontStyles(model.font)}
      }
  `);

  /* Applied to antd `classNames.root`, which lands on the affix wrapper when Allow Clear or a
     prefix/suffix creates one, and on the textarea itself when it does not. Every rule is therefore
     scoped inside the wrapper class, so nothing here touches a plain, unwrapped textarea. */
  const textAreaRoot = cx('sha-text-area-root', css`
      &[class*="-textarea-affix-wrapper"] {
        ${configuredAppearance}
        ${paddingStyles(model.stylingBoxJson)}
        ${dimensionsStyles(model.dimensions)}
        /* The inner textarea inherits its font size from here. */
        ${fontStyles(model.font)}

        /* Neutralise the inner element so the two do not both paint, and restate the font so the
           colour survives — only font-size is covered by the antd reset. Margin and padding are
           zeroed or the configured spacing would be applied twice. */
        &&&& textarea.ant-input,
        &&&& textarea.ant-input:hover,
        &&&& textarea.ant-input:focus,
        &&&& textarea.ant-input:focus-within {
          background: transparent;
          border: none;
          box-shadow: none;
          margin: 0;
          padding: 0;
          ${fontStyles(model.font)}
        }

        /* The clear icon takes its colour from the wrapper text colour by default, which the
           configured font colour should drive. */
        .ant-input-clear-icon {
          color: inherit;
        }
      }
  `);

  return {
    textArea,
    textAreaRoot,
  };
});
