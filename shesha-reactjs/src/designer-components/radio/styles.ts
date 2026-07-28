import { createStyles } from '@/styles';
import { IRadioComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

/**
 * The appearance settings of a radio group describe a single option, not the group as a whole,
 * so every style builder is scoped to a descendant selector of the repeated option element.
 * Border/background/dimensions land on the radio indicator, font on the option label.
 */
export const useStyles = createStyles(({ css, cx, prefixCls }, model: IRadioComponentProps) => {
  const indicatorStyles = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
    ${dimensionsStyles(model.dimensions)}
  `;

  const radioGroup = cx('sha-radio-group', css`
      .${prefixCls}-radio-wrapper {
        ${paddingStyles(model.stylingBoxJson)}
        ${fontStyles(model.font)}

        span.${prefixCls}-radio + * {
          ${fontStyles(model.font)}
        }
      }

      .${prefixCls}-radio .${prefixCls}-radio-inner {
        ${indicatorStyles}
      }

      /* antd themes the checked state separately, so the same block is repeated
         to keep the configured border/background from being overridden. */
      .${prefixCls}-radio-checked .${prefixCls}-radio-inner {
        ${indicatorStyles}
      }
  `);

  return {
    radioGroup,
  };
});
