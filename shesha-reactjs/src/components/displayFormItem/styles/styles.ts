import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const lineHeight = "27px";

  const autocompleteFormItem = "autocomplete-form-item";
  const displayFormItem = cx("display-form-item", css`
        .${prefixCls}-form-item-label {
            line-height: ${lineHeight};
        }
    
        .${prefixCls}-form-item-control-wrapper {
            .${prefixCls}-form-item-control {
                line-height: @line-height;
    
                .${prefixCls}-input {
                    border-radius: 0;
                    border: none;
                    border-bottom: 1px solid #d9d9d9;
                }
    
                .${prefixCls}-save-btn {
                    border-radius: 4px !important;
                }
            }
        }
    
        &.${autocompleteFormItem} {
            .${prefixCls}-form-item-control-input-content {
                display: flex;
                align-items: center;
    
                .dsd-auto-complete-places {
                    margin-right: 5px;
                }
            }
        }
  `);

  return {
    displayFormItem,
    autocompleteFormItem,
  };
});
