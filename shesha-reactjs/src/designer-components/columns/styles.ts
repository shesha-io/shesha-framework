import { createStyles } from '@/styles';
import { IColumnsComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';

export const useStyles = createStyles(({ css, cx }, model: IColumnsComponentProps) => {
  const shaColumnComponent = cx("sha-column-component", css`
      ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${marginStyles(model.stylingBoxJson)}
      ${paddingStyles(model.stylingBoxJson)}
  `);

  return {
    shaColumnComponent,
  };
});
