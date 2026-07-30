import { createStyles } from '@/styles';
import { IRadioComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, marginStyles, shadowStyles } from '../_common/styles/utils';

/**
 * The appearance settings of a radio group describe a single option, not the group as a whole,
 * so every style builder is scoped to a descendant selector of the repeated option element.
 * Border/background/dimensions land on the radio indicator, font on the option label.
 */
export const useStyles = createStyles(({ css, cx, prefixCls }, model: IRadioComponentProps) => {
  const indicatorStyles = `
    ${backgroundStyles(model.radio?.background)};
  `;

  const radioGroup = cx('sha-radio-group', css`
    ${borderStyles(model.border)}
    ${dimensionsStyles(model.dimensions)}
    ${backgroundStyles(model.background)}
    ${paddingStyles(model.stylingBoxJson)}
    ${shadowStyles(model.shadow)}
    .${prefixCls}-radio-wrapper {
      ${fontStyles(model.font)}
      ${paddingStyles(model.radio?.stylingBoxJson)}
      ${marginStyles(model.radio?.stylingBoxJson)}
      span.${prefixCls}-radio + * {
        ${fontStyles(model.font)}
      }

      .ant-wave-target {
        ${borderStyles(model.radio?.border)}
        ${shadowStyles(model.radio?.shadow)}
        height: ${model.font?.size ?? 16}px;
        width: ${model.font?.size ?? 16}px;
        ${dimensionsStyles(model.radio?.dimensions)}
      }
        
    }

    .${prefixCls}-radio-checked{
      ${indicatorStyles}
    }
  `);

  return {
    radioGroup,
  };
});
