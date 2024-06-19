import { createStyles } from '@/styles';
import { sheshaStyles, getTextHoverEffects } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
    const readOnlyModeToggler = "read-only-mode-toggler";
    const readOnlyDisplayFormItem = cx("read-only-display-form-item", css`
        &.${prefixCls}-form-item {
            margin-bottom: unset;
        }
  
        .${readOnlyModeToggler} {
              margin-left: ${sheshaStyles.paddingLG}px;
  
              &:not(.disabled) {
                cursor: pointer;
                ${getTextHoverEffects(token)}
            }
        }
  `); 
  return {
    readOnlyDisplayFormItem,
    readOnlyModeToggler,
  };
});