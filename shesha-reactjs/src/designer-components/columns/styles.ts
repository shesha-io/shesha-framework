import { createStyles } from '@/styles';
import { IColumnsComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';

export const useStyles = createStyles(({ css, cx, token }, model: IColumnsComponentProps) => {
  const shaColumnDesignerWrapper = 'sha-column-designer-wrapper';
  const shaColumnComponent = cx("sha-column-component", css`
      ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${marginStyles(model.stylingBoxJson)}
      ${paddingStyles(model.stylingBoxJson)}

      .${shaColumnDesignerWrapper} {
        border: 1px dashed transparent;
        &:hover {
          border: 1px dashed ${token.colorPrimary};
        }
      }
  `);

  return {
    shaColumnComponent,
    shaColumnDesignerWrapper,
  };
});
