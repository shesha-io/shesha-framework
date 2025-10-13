import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const columnsFilterSelect = cx("columns-filter-select", css`
        display: flex;
        align-items: center;
    
        .label {
        margin-right: ${sheshaStyles.paddingLG}px;
            font-weight: 600;
        }
    
        .${prefixCls}-select {
            flex: 1;
            margin-right: ${sheshaStyles.paddingSM}px;
    
            ul {
                li {
                    &.${prefixCls}-select-selection__choice {
                        display: none;
                    }
                }
            }
        
            .${prefixCls}-select-dropdown-menu-item-selected {
                // display: none;
            }
        }    
    `);

  return {
    columnsFilterSelect,
  };
});
