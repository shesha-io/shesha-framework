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
      topLeft: isTop || isLeft ? 0 : model.border?.radius?.topLeft ?? model.border?.radius?.all,
      topRight: isTop || isRight ? 0 : model.border?.radius?.topRight ?? model.border?.radius?.all,
      bottomLeft: isBottom || isLeft ? 0 : model.border?.radius?.bottomLeft ?? model.border?.radius?.all,
      bottomRight: isBottom || isRight ? 0 : model.border?.radius?.bottomRight ?? model.border?.radius?.all,
    },
  };

  const borderLines: IBorderValue = {
    borderType: 'custom',
    border: {
      top: model.border?.borderType === 'custom' ? model.border.border?.top : model.border?.border?.all,
      right: model.border?.borderType === 'custom' ? model.border.border?.right : model.border?.border?.all,
      bottom: model.border?.borderType === 'custom' ? model.border.border?.bottom : model.border?.border?.all,
      left: model.border?.borderType === 'custom' ? model.border.border?.left : model.border?.border?.all,
    },
  };

  const borderLinesContent: IBorderValue = {
    borderType: 'custom',
    border: {
      top: isTop ? { width: 0 } : borderLines.border?.top,
      right: isRight ? { width: 0 } : borderLines.border?.right,
      bottom: isBottom ? { width: 0 } : borderLines.border?.bottom,
      left: isLeft ? { width: 0 } : borderLines.border?.left,
    },
  };

  const background = backgroundCss(model.background);
  const cardBackground = backgroundCss(model.card?.background);

  const shaTabContent = cx('sha-tab-content', css`
      &&&& {
        ${/* --ant-tabs-horizontal-margin: 0 !important;*/ ''}
        height: 100%;
        ${marginStyles(model.stylingBoxJson)}
        ${dimensionsStyles(model.dimensions)}
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

              .ant-tabs-tab {
                  --ant-tabs-card-bg: ${cardBackground};
                  ${isDefined(model.font?.color) ? `--ant-tabs-item-hover-color: ${model.font.color} !important;` : ''}
                  ${isDefined(model.font?.color) ? `--ant-tabs-item-active-color: ${model.font.color} !important;` : ''}
                  --ant-line-width: ${addPx(isLeft ? borderLines.border?.left?.width ?? 0 : isRight ? borderLines.border?.right?.width ?? 0
                    : isTop ? borderLines.border?.top?.width ?? 0 : borderLines.border?.bottom?.width ?? 0)};
                  --ant-color-border-secondary: ${isLeft ? borderLines.border?.left?.color ?? 'none' : isRight ? borderLines.border?.right?.color ?? 'none'
                    : isTop ? borderLines.border?.top?.color ?? 'none' : borderLines.border?.bottom?.color ?? 'none'};
                  --ant-line-type:  ${isLeft ? borderLines.border?.left?.style ?? 'none' : isRight ? borderLines.border?.right?.style ?? 'none'
                    : isTop ? borderLines.border?.top?.style ?? 'none' : borderLines.border?.bottom?.style ?? 'none'};          

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

                  ${fontStyles(model.font)}
                  ${isDefined(model.font?.color) ? `--ant-tabs-item-selected-color: ${model.font.color} !important;` : ''}
                  --primary-color: ${token.colorPrimary} !important;
                  --ant-tabs-card-bg: ${background};
                  --ant-color-bg-container: ${background};
                  --ant-line-width: ${addPx(isLeft ? borderLines.border?.left?.width ?? 0 : isRight ? borderLines.border?.right?.width ?? 0
                    : isTop ? borderLines.border?.top?.width ?? 0 : borderLines.border?.bottom?.width ?? 0)};
                  --ant-color-border-secondary: ${isLeft ? borderLines.border?.left?.color ?? 'none' : isRight ? borderLines.border?.right?.color ?? 'none'
                    : isTop ? borderLines.border?.top?.color ?? 'none' : borderLines.border?.bottom?.color ?? 'none'};
                  --ant-line-type:  ${isLeft ? borderLines.border?.left?.style ?? 'none' : isRight ? borderLines.border?.right?.style ?? 'none'
                    : isTop ? borderLines.border?.top?.style ?? 'none' : borderLines.border?.bottom?.style ?? 'none'};          
                  --ant-color-bg-container: ${background};

                  ${tabType === 'card' ? backgroundStyles(model.background) : ''}
                  ${dimensionsStyles(model.card?.dimensions)}
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
