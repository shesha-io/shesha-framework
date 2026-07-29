import { createStyles } from '@/styles';
import { IRadioComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

/**
 * Emits the two Appearance style sets.
 *
 * The bare-named model properties style the component wrapper (the group container) — including
 * the font, which cascades to the option labels. The `radio` set is scoped to descendant selectors
 * so it styles the radio indicator of every option.
 */
export const useStyles = createStyles(({ css, cx, prefixCls, token }, model: IRadioComponentProps) => {
  const radio = model.radio;

  const indicatorStyles = `
    ${borderStyles(radio?.border)}
    ${backgroundStyles(radio?.background)}
    ${dimensionsStyles(radio?.dimensions)}
    ${paddingStyles(radio?.stylingBoxJson)}
  `;

  const radioGroup = cx('sha-radio-group', css`
      /* Wrapper set — styles the group container itself. */
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${dimensionsStyles(model.dimensions)}
      ${paddingStyles(model.stylingBoxJson)}
      ${fontStyles(model.font)}

      /* The label of each option inherits the wrapper's font. */
      .${prefixCls}-radio-wrapper {
        ${fontStyles(model.font)}

        span.${prefixCls}-radio + * {
          ${fontStyles(model.font)}
        }

        /* Radio set — styles the indicator of each option. */
        .${prefixCls}-radio-input {
          ${indicatorStyles}
        }
      }

      /* antd themes the checked state separately, so the same block is repeated
         to keep the configured border/background from being overridden. */
      .${prefixCls}-radio-checked .${prefixCls}-radio-inner {
        ${indicatorStyles}
      }

      .${prefixCls}-radio-wrapper:hover .${prefixCls}-radio-inner {
        border-color: ${token.colorPrimary};
      }
  `);

  return {
    radioGroup,
  };
});
