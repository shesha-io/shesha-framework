import { createStyles } from '@/styles';
import { ITabsComponentProps } from './models';
import { backgroundCss, backgroundStyles, borderCss, borderLinesStyles, borderRadiusStyles, cssPropertiesToString, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { IBorderValue } from '../_settings/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { addPx } from '@/utils/style';
import { CSSProperties } from 'react';

export const useStyles = createStyles(({ css, cx, token }, { model, cardStyleCss, activeCardStyleCss }: { model: ITabsComponentProps; cardStyleCss?: CSSProperties | undefined; activeCardStyleCss?: CSSProperties | undefined }) => {
  const tabType = model.tabType ?? 'card';

  const isLeft = model.tabPosition === 'left';
  const isRight = model.tabPosition === 'right';
  const isTop = model.tabPosition === 'top';
  const isBottom = model.tabPosition === 'bottom';

  const borderRadius: IBorderValue = {
    radiusType: 'custom',
    radius: {
      topLeft: isTop || isLeft ? 0 : model.border?.radiusType === 'custom' ? model.border.radius?.topLeft : model.border?.radius?.all,
      topRight: isTop || isRight ? 0 : model.border?.radiusType === 'custom' ? model.border.radius?.topRight : model.border?.radius?.all,
      bottomLeft: isBottom || isLeft ? 0 : model.border?.radiusType === 'custom' ? model.border.radius?.bottomLeft : model.border?.radius?.all,
      bottomRight: isBottom || isRight ? 0 : model.border?.radiusType === 'custom' ? model.border.radius?.bottomRight : model.border?.radius?.all,
    },
  };

  const toBorderLines = (border: IBorderValue | undefined): IBorderValue => ({
    borderType: 'custom',
    border: {
      top: border?.borderType === 'custom' ? border.border?.top : border?.border?.all,
      right: border?.borderType === 'custom' ? border.border?.right : border?.border?.all,
      bottom: border?.borderType === 'custom' ? border.border?.bottom : border?.border?.all,
      left: border?.borderType === 'custom' ? border.border?.left : border?.border?.all,
    },
  });
  const borderLines = toBorderLines(model.border);
  // Tab cards use their own border (theme Header Defaults / Card Styles), falling back to the body's.
  // antd draws a tab card's border from one line, so take the side that faces the content.
  const cardBorderLines = isDefined(model.card?.border) ? toBorderLines(model.card.border) : borderLines;
  const cardEdge = isLeft ? cardBorderLines.border?.left : isRight ? cardBorderLines.border?.right
    : isTop ? cardBorderLines.border?.top : cardBorderLines.border?.bottom;
  const cardBorderVars = `
    --ant-line-width: ${addPx(cardEdge?.width ?? 0)};
    --ant-color-border-secondary: ${cardEdge?.color ?? 'none'};
    --ant-line-type: ${cardEdge?.style ?? 'none'};
  `;

  const borderLinesContent: IBorderValue = {
    borderType: 'custom',
    border: {
      top: isTop ? { width: 0 } : borderLines.border?.top,
      right: isRight ? { width: 0 } : borderLines.border?.right,
      bottom: isBottom ? { width: 0 } : borderLines.border?.bottom,
      left: isLeft ? { width: 0 } : borderLines.border?.left,
    },
  };

  const cardBackground = backgroundCss(model.card?.background);

  const shaTabContent = cx('sha-tab-content', css`
      &&&& {
        ${/* --ant-tabs-horizontal-margin: 0 !important;*/ ''}
        height: 100%;
        ${marginStyles(model.stylingBoxJson)}
        ${dimensionsStyles(model.dimensions)}

        ${/* Card margin & padding apply to every tab card (selected and not). The extra specificity beats antd's
             gutter rules (e.g. '.ant-tabs-card.ant-tabs-top > .ant-tabs-nav .ant-tabs-tab + .ant-tabs-tab'). */ ''}
        .ant-tabs-nav .ant-tabs-tab {
          ${paddingStyles(model.card?.stylingBoxJson)}
          ${marginStyles(model.card?.stylingBoxJson)}
        }
      }

      .ant-tabs-body-holder {
          ${(isLeft && (model.shadow?.offsetX ?? 0) > 0) ||
          (isRight && (model.shadow?.offsetX ?? 0) < 0) ||
          (isTop && (model.shadow?.offsetY ?? 0) > 0) ||
          (isBottom && (model.shadow?.offsetY ?? 0) < 0)
            ? 'z-index: 1; /* to make shadow from tabs hidden */'
            : ''}
          ${/* --ant-tabs-card-bg: ${background};*/ ''}
          width: 100%;
          height: auto;
          ${borderLinesStyles(borderLinesContent)}
          ${backgroundStyles(model.background)}
          ${borderRadiusStyles(borderRadius)}
          ${shadowStyles(model.shadow)}
          ${paddingStyles(model.stylingBoxJson)}
          ${cssPropertiesToString(model.styleCss)}

          .ant-tabs-body {
              ${paddingStyles(model.card?.stylingBoxJson)}
              height: 100%;
              width: 100%;
              overflow: auto;
              scrollbar-width: thin;

              &::-webkit-scrollbar { 
                  width: 8px;
                  background-color: transparent;
              }
          }
      }

      .ant-tabs-nav {
          margin: 0;
          --ant-tabs-ink-bar-color: ${isNullOrWhiteSpace(model.tabLineColor) ? token.colorPrimary : model.tabLineColor} !important;

          .ant-tabs-nav-wrap {
              overflow: visible; /* to make shadow visible */

              ${/* Every tab card, selected or not, takes the card styles (which inherit the theme's Header Defaults). */ ''}
              .ant-tabs-tab {
                  --ant-tabs-card-bg: ${cardBackground};
                  ${isDefined(model.card?.font?.color) ? `--ant-tabs-item-hover-color: ${model.card.font.color} !important;` : ''}
                  ${isDefined(model.card?.font?.color) ? `--ant-tabs-item-active-color: ${model.card.font.color} !important;` : ''}
                  ${isDefined(model.card?.font?.color) ? `--ant-tabs-item-selected-color: ${model.card.font.color} !important;` : ''}
                  ${cardBorderVars}

                  ${fontStyles(model.card?.font)}
                  ${dimensionsStyles(model.card?.dimensions)}
                  ${tabType === 'card' ? backgroundStyles(model.card?.background) : ''}
                  ${tabType === 'card' ? shadowStyles(model.shadow) : ''}

                  ${cssPropertiesToString(cardStyleCss)}

                  .ant-tabs-tab-btn {
                      width: 100%;
                  }
              }

              .ant-tabs-tab.ant-tabs-tab-active {
                  ${isLeft ? 'border-right-width: 0px;' : ''}
                  ${isRight ? 'border-left-width: 0px;' : ''}
                  ${isTop ? 'border-bottom-width: 0px;' : ''}
                  ${isBottom ? 'border-top-width: 0px;' : ''}

                  --primary-color: ${token.colorPrimary} !important;
                  --ant-color-bg-container: ${cardBackground};
                  z-index: 2;
                  ${cssPropertiesToString(activeCardStyleCss)}
              }

              .ant-tabs-tab.ant-tabs-tab-disabled {
                color: ${token.colorTextDisabled};
                cursor: not-allowed;
              }                  
          }
      }

      .ant-tabs-nav::before {
          content: '';
          ${isLeft ? `border-right: ${borderCss(borderLines.border?.left)};` : ''}
          ${isRight ? `border-left: ${borderCss(borderLines.border?.right)};` : ''}
          ${isTop ? `border-bottom: ${borderCss(borderLines.border?.top)};` : ''}
          ${isBottom ? `border-top: ${borderCss(borderLines.border?.bottom)};` : ''}
          
          ${isLeft || isRight ? `
            height: 100%;
            position: absolute;
            top: 0;
            ${isLeft ? `right: 0;` : `left: 0;`}
            ` : ''}
      }
  `,
  );

  return {
    shaTabContent,
  };
});
