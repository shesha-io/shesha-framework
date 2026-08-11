import { createStyles } from '@/styles';
import { getOverflowStyle } from '../_settings/utils/overflow/util';
import { CSSObject } from 'antd-style';
import { IContainerComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils';
import { addPx } from '@/utils/style';

export const useStyles = createStyles(({ css, cx }, model: IContainerComponentProps) => {
  const overflowStyles = { ...getOverflowStyle(true, false) };

  const horizontalNotBlock = model.direction === 'horizontal' || model.display !== 'block';
  const horizontalAndJustifyContent = model.direction === 'horizontal' && isDefined(model.justifyContent);
  const grid = model.display === 'grid' || model.display === 'inline-grid';
  const flex = model.display === 'flex';

  const gridColumnWidth = addPx(model.gridColumnsWidth) ?? 'auto';
  const gridRowHeight = addPx(model.gridRowsHeight) ?? 'auto';

  const container = cx("sha-container-component", css`
        transition: all 0.2s ease;

        overflow: hidden;
        ${borderStyles(model.border)}
        ${backgroundStyles(model.background)}
        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}
        /* dimensions will by applied to the wrapper div */
        height: 100%;
        width: 100%;

        ${isDefined(model.alignSelf) ? `align-self: ${model.alignSelf};` : ''}
        ${isDefined(model.justifySelf) ? `justify-self: ${model.justifySelf};` : ''}

        > .sha-components-container-inner {
          height: 100%;
          width: 100%;
          
          ${overflowStyles as CSSObject}
          
          ${isDefined(model.display) ? `display: ${model.display};` : ''}

          ${horizontalNotBlock && isDefined(model.textJustify) ? `text-justify: ${model.textJustify};` : ''}
          ${horizontalNotBlock && isDefined(model.gap) ? `gap: ${addPx(model.gap) ?? model.gap};` : ''}
          ${(horizontalNotBlock || horizontalAndJustifyContent) && isDefined(model.justifyContent) ? `justify-content: ${model.justifyContent};` : ''}
          ${(horizontalNotBlock || horizontalAndJustifyContent) && isDefined(model.alignItems) ? `align-items: ${model.alignItems};` : ''}
          ${(horizontalNotBlock || horizontalAndJustifyContent) && isDefined(model.justifyItems) ? `justify-items: ${model.justifyItems};` : ''}

          ${grid && isDefined(model.gridColumnsCount) && model.gridColumnsCount > 0 && Number.isInteger(model.gridColumnsCount) ? `grid-template-columns: repeat(${model.gridColumnsCount}, minmax(0, ${gridColumnWidth}));` : ''}
          ${grid && isDefined(model.gridRowsCount) && model.gridRowsCount > 0 && Number.isInteger(model.gridRowsCount) ? `grid-template-rows: repeat(${model.gridRowsCount}, minmax(0, ${gridRowHeight}));` : ''}

          ${flex && isDefined(model.flexDirection) ? `flex-direction: ${model.flexDirection};` : ''}
          ${flex && isDefined(model.flexWrap) ? `flex-wrap: ${model.flexWrap};` : ''}
        }
    `);

  return {
    container,
  };
});
