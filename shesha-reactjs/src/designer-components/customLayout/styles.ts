import { createStyles } from '@/styles';
import { CSSObject } from 'antd-style';
import { getOverflowStyle } from '../_settings/utils/overflow/util';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils';
import { addPx } from '@/utils/style';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';
import { ICustomLayoutComponentProps } from './interfaces';

export const useStyles = createStyles(({ css, cx }, model: ICustomLayoutComponentProps) => {
  const overflowStyles = { ...getOverflowStyle(true, false) };

  const horizontalNotBlock = model.direction === 'horizontal' || model.display !== 'block';
  const horizontalAndJustifyContent = model.direction === 'horizontal' && isDefined(model.justifyContent);
  const grid = model.display === 'grid' || model.display === 'inline-grid';
  const flex = model.display === 'flex';

  const gridColumnWidth = addPx(model.gridColumnsWidth) ?? 'auto';
  const gridRowHeight = addPx(model.gridRowsHeight) ?? 'auto';

  const customLayout = cx("sha-custom-layout-component", css`
        transition: all 0.2s ease;

        overflow: hidden;
        ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
        ${borderStyles(model.border)}
        ${backgroundStyles(model.background)}
        ${shadowStyles(model.shadow)}
        ${marginStyles(model.stylingBoxJson)}

        ${isDefined(model.alignSelf) ? `align-self: ${model.alignSelf};` : ''}
        ${isDefined(model.justifySelf) ? `justify-self: ${model.justifySelf};` : ''}

        > .sha-components-container-inner {
          ${paddingStyles(model.stylingBoxJson)}
          height: 100%;
          width: 100%;
          box-sizing: border-box;

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

  const heading = cx("sha-custom-layout-heading", css`
        /* The container owns the padding, so the heading repeats it to stay aligned with the children. */
        ${paddingStyles(model.stylingBoxJson)}
        padding-bottom: 4px;
        ${fontStyles(model.headingFont)}
        ${isDefined(model.labelAlign) ? `text-align: ${model.labelAlign};` : ''}
    `);

  return {
    customLayout,
    heading,
  };
});
