import { createStyles } from '@/styles';
import { ITextComponentProps } from '../models';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles } from '@/designer-components/_common/styles/utils';
import { getFullSizeComponentDimensions } from '@/components/formDesigner/utils/stylingUtils';

export const useStyles = createStyles(({ css, cx, token }, model: ITextComponentProps) => {
  const primary = "primary";
  const info = "info";
  const shaTypographyText = cx("sha-typography-text", css`
      ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}    
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${marginStyles(model.stylingBoxJson)}
      ${paddingStyles(model.stylingBoxJson)}
      ${fontStyles(model.font)}
    
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
