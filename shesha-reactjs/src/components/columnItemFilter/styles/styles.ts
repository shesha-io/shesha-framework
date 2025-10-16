import { createStyles, sheshaStyles, getTextHoverEffects } from '@/styles';


export const useStyles = createStyles(({ css, cx, token, prefixCls, iconPrefixCls }) => {
  const filterHeading = "filter-heading";
  const filterInput = "filter-input";
  const shaColumnItemFilter = cx("sha-column-item-filter", css`
        margin-bottom: ${sheshaStyles.paddingLG}px;
    
        .${filterHeading} {
            display: flex;
            justify-content: space-between;
            margin-bottom: ${sheshaStyles.paddingSM}px;
    
            .label {
                font-weight: 600;
                margin-right: ${sheshaStyles.paddingLG}px;
            }
    
            .${iconPrefixCls} {
                ${getTextHoverEffects(token)}
    
                &.${iconPrefixCls}-delete {
                    display: none;
                }
        
                padding-left: ${sheshaStyles.paddingSM}px;
            }
        }
    
        .${filterInput} {
            display: flex;
            justify-content: space-between;
    
            .ant-calendar-picker,
            .ant-checkbox-wrapper {
                flex: 1; // Make sure the DatePicker spans the whole width. Same applies to the label for the checkbox
            }
    
            .${prefixCls}-input-number {
                flex: 1;
        
                &:first-child {
                    margin-right: calc(${sheshaStyles.paddingLG}px / 2);
                }
        
                &:last-child {
                    margin-left: calc(${sheshaStyles.paddingLG}px / 2);
                }
        
                &.${prefixCls}-input-number-no-margin {
                    margin: unset;
                }
            }
        }
    
        &:hover {
            .${iconPrefixCls} {
                &.${iconPrefixCls}-delete {
                    display: inline-block;
                }
            }
        }
  `);
  return {
    shaColumnItemFilter,
    filterHeading,
    filterInput,
  };
});
