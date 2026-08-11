import { createStyles } from '@/styles';
import { ITextComponentProps } from '../models';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles } from '@/designer-components/_common/styles/utils';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';

export const useStyles = createStyles(({ css, cx, token }, model: ITextComponentProps) => {
  const primary = "primary";
  const info = "info";
  const shaTypographyText = cx("sha-typography-text", css`
      ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}    
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${paddingStyles(model.stylingBoxJson)}
      ${fontStyles(model.font)}
      &&&& {
        margin: 0px;
      }
    
      &.ant-form-item-control-input {
        margin: 0px;
        padding: 0px;
      }
        
      &.${primary} {
        color: ${token.colorPrimary};
      }
    
      &.${info} {
        color: ${token.colorInfo}
      }
  `);
  return {
    typographyText: shaTypographyText,
    primary,
    info,
  };
});
