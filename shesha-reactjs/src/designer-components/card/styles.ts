import { createStyles } from '@/styles';
import { ICardComponentProps } from './interfaces';
import { backgroundStyles, borderCss, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';
import { shaHeaderComponentsContainer } from '@/components/panel/styles/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: ICardComponentProps) => {
  const header = model.headerStyles;
  // The heading bar sits inside the card's own border, so its border is drawn as the line under it.
  // Hide Border wins: no line under the header at all.
  const headerBorder = header?.border?.hideBorder === true
    ? undefined
    : header?.border?.borderType === 'custom' ? header.border.border?.bottom : header?.border?.border?.all;
  // The header always spans the card, so only its heights apply.
  const headerDimensions = dimensionsStyles({ ...header?.dimensions, width: undefined, minWidth: undefined, maxWidth: undefined });
  const headerBackground = backgroundStyles(header?.background);
  const shaCardComponent = cx("sha-card-component", css`
      ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${marginStyles(model.stylingBoxJson)}
      
      /* The background is the card's (above): painting it again here would double a translucent one. */
      > .${prefixCls}-card-body {
        background: transparent;
        ${paddingStyles(model.stylingBoxJson)}
      }

      &&& > .${prefixCls}-card-head {
        /* Follow the card's own corners, so a header background never pokes out of them. */
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        ${headerBackground}
        ${headerDimensions}
        margin-bottom: 0;
        ${paddingStyles(header?.stylingBoxJson)}
        ${header?.border?.hideBorder === true ? 'border-bottom: none;' : isDefined(headerBorder) ? `border-bottom: ${borderCss(headerBorder)};` : ''}

        .${prefixCls}-card-head-title {
          ${fontStyles(header?.font)}
          /* The title holds the configurable header: let it show drop hints, dropdowns and wrapping content. */
          overflow: visible;
          white-space: normal;

          > .${shaHeaderComponentsContainer} {
            width: 100%;
          }
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
