import { createStyles } from '@/styles';
import { IRadioComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';

/**
 * Emits the two Appearance style sets.
 *
 * The bare-named model properties style the component wrapper (the group container), while the
 * `option` set is scoped to descendant selectors so it styles every radio button: border,
 * background, dimensions and shadow land on the radio indicator, font on the option label.
 */
export const useStyles = createStyles(({ css, cx, prefixCls, token }, model: IRadioComponentProps) => {
  const option = model.option;

  const indicatorStyles = `
    ${borderStyles(option?.border)}
    ${backgroundStyles(option?.background)}
    ${shadowStyles(option?.shadow)}
    ${dimensionsStyles(option?.dimensions)}
  `;

  const radioGroup = cx('sha-radio-group', css`
      /* Wrapper set — styles the group container itself. */
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${dimensionsStyles(model.dimensions)}
      ${paddingStyles(model.stylingBoxJson)}

      /* Option set — styles each radio button. */
      .${prefixCls}-radio-wrapper {
        ${paddingStyles(option?.stylingBoxJson)}
        ${fontStyles(option?.font)}

        span.${prefixCls}-radio + * {
          ${fontStyles(option?.font)}
        }

        .${prefixCls}-radio-inner {
          ${indicatorStyles}
        }
      }

      /* antd themes the checked state separately, so the same block is repeated
         to keep the configured border/background from being overridden. */
      .${prefixCls}-radio-checked .${prefixCls}-radio-inner {
        ${indicatorStyles}
        ${isDefined(option?.font?.color) ? `&:after { background-color: ${option.font.color}; }` : ''}
      }

      .${prefixCls}-radio-wrapper:hover .${prefixCls}-radio-inner {
        border-color: ${token.colorPrimary};
      }
  `);

  return {
    radioGroup,
  };
});
