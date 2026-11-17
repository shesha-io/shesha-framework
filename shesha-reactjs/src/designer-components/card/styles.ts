import { createStyles } from '@/styles';
import { ICardComponentProps } from './interfaces';
import { backgroundStyles, borderCss, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: ICardComponentProps) => {
  const header = model.headerStyles;
  // The heading bar sits inside the card's own border, so its border is drawn as the line under it.
  const headerBorder = header?.border?.borderType === 'custom' ? header.border.border?.bottom : header?.border?.border?.all;

  const shaCardComponent = cx("sha-card-component", css`
      ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${marginStyles(model.stylingBoxJson)}
      
      > .${prefixCls}-card-body {
        ${paddingStyles(model.stylingBoxJson)}
      }

      > .${prefixCls}-card-head {
        /* Follow the card's own corners, so a heading background never pokes out of them. */
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        ${isDefined(headerBorder) ? `border-bottom: ${borderCss(headerBorder)};` : ''}

        .${prefixCls}-card-head-title {
          ${fontStyles(header?.font)}
        }
      }
  `);

  const hideWhenEmpty = cx("hide-empty", css`
      &:not(:has(>.${prefixCls}-card-body .${prefixCls}-form-item:not(.${prefixCls}-form-item-hidden))) {
        display: none;
      }
    `);

  return {
    hideWhenEmpty,
    shaCardComponent,
  };
});
