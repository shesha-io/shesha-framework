import { createStyles } from '@/styles';
import { ICardComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: ICardComponentProps) => {
  const shaCardComponent = cx("sha-card-component", css`
      ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${marginStyles(model.stylingBoxJson)}
      
      > .${prefixCls}-card-body {
        ${paddingStyles(model.stylingBoxJson)}
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
