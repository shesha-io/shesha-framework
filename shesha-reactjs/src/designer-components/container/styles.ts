import { createStyles } from '@/styles';
import { getOverflowStyle } from '../_settings/utils/overflow/util';
import { CSSObject } from 'antd-style';
import { IContainerComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils';
import { addPx } from '@/utils/style';

export const useStyles = createStyles(({ css, cx }, model: IContainerComponentProps) => {
  const overflowStyles = { ...getOverflowStyle(true, false) };

  const horizontalNotBlock = model.direction === 'horizontal' || model.display !== 'block';
  const horizontalAndJustifyContent = model.direction === 'horizontal' && isDefined(model.justifyContent);
  const grid = model.display === 'grid' || model.display === 'inline-grid';
  const flex = model.display === 'flex';

  const container = cx("sha-container-component", css`
        overflow: hidden;
        ${borderStyles(model.border)}
        ${backgroundStyles(model.background)}
        ${shadowStyles(model.shadow)}
        ${marginStyles(model.stylingBoxJson)}
        ${paddingStyles(model.stylingBoxJson)}
        ${dimensionsStyles({ ...model.dimensions, width: '100%' })}

        ${isDefined(model.alignSelf) ? `align-self: ${model.alignSelf};` : ''}
        ${isDefined(model.justifySelf) ? `justify-self: ${model.justifySelf};` : ''}

        > .sha-components-container-inner {
          height: 100%;
          width: 100%;
          
          ${overflowStyles as CSSObject}
          
          ${isDefined(model.display) ? `display: ${model.display};` : ''}

          ${horizontalNotBlock && isDefined(model.textJustify) ? `text-justify: ${model.textJustify};` : ''}
          ${horizontalNotBlock && isDefined(model.gap) ? `gap: ${addPx(model.gap)};` : ''}
          ${(horizontalNotBlock || horizontalAndJustifyContent) && isDefined(model.justifyContent) ? `justify-content: ${model.justifyContent};` : ''}
          ${(horizontalNotBlock || horizontalAndJustifyContent) && isDefined(model.alignItems) ? `align-items: ${model.alignItems};` : ''}
          ${(horizontalNotBlock || horizontalAndJustifyContent) && isDefined(model.justifyItems) ? `justify-items: ${model.justifyItems};` : ''}

          ${grid && isDefined(model.gridColumnsCount) ? `grid-template-columns: repeat(${model.gridColumnsCount}, minmax(0, 1fr));` : ''}

          ${flex && isDefined(model.flexDirection) ? `flex-direction: ${model.flexDirection};` : ''}
          ${flex && isDefined(model.flexWrap) ? `flex-wrap: ${model.flexWrap};` : ''}
        }
    `);

  return {
    container,
  };
});
