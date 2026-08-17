import { CSSProperties } from 'react';
import { createStyles } from '@/styles';
import { IRadioComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, cssPropertiesToString, dimensionsStyles, fontStyles, paddingStyles, marginStyles, shadowStyles, splitBackgroundProperties } from '../_common/styles/utils';

/**
 * The appearance settings of a radio group describe a single option, not the group as a whole,
 * so every style builder is scoped to a descendant selector of the repeated option element.
 * Border/background/dimensions land on the radio indicator, font on the option label.
 */
/**
 * `radio.style` holds a JS expression, so the Factory evaluates it and passes the resulting
 * CSSProperties in as `radioStyleJson`. The wrapper's own custom style is applied inline by the
 * framework (as `styleJson`), but a nested set has no such route — it has to be emitted into
 * the scoped rule here.
 */
type RadioStylesArgs = IRadioComponentProps & {
  radioStyleJson?: CSSProperties | undefined;
};

export const useStyles = createStyles(({ css, cx, prefixCls }, model: RadioStylesArgs) => {
  // Background is separated so it can follow the checked-only convention below.
  const customStyle = splitBackgroundProperties(model.radioStyleJson);

  const indicatorStyles = `
    ${backgroundStyles(model.radio?.background)};
    ${cssPropertiesToString(customStyle.background)}
  `;

  const radioGroup = cx('sha-radio-group', css`
    ${borderStyles(model.border)}
    ${dimensionsStyles(model.dimensions)}
    ${backgroundStyles(model.background)}
    ${paddingStyles(model.stylingBoxJson)}
    ${marginStyles(model.stylingBoxJson)}
    ${shadowStyles(model.shadow)}
    .${prefixCls}-radio-wrapper {
      ${fontStyles(model.font, model.styleCss)}
      ${paddingStyles(model.radio?.stylingBoxJson)}
      ${marginStyles(model.radio?.stylingBoxJson)}
      span.${prefixCls}-radio + * {
        ${fontStyles(model.font, model.styleCss)}
      }

      .ant-wave-target {
        ${borderStyles(model.radio?.border)}
        ${shadowStyles(model.radio?.shadow)}
        height: ${model.font?.size ?? 16}px;
        width: ${model.font?.size ?? 16}px;
        ${dimensionsStyles(model.radio?.dimensions)}

        /* Custom style last so it wins over the panel settings above, matching how the
           wrapper's own custom style overrides its panels. Its background declarations are
           held back and applied to the checked indicator instead. */
        ${cssPropertiesToString(customStyle.rest)}
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
