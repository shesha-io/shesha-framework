import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const shaIndexTableColumnFilters = cx("sha-index-table-column-filters", css`
        display: flex;
        flex-direction: column;
      
        .${prefixCls}-divider {
          margin: ${sheshaStyles.paddingSM}px 0;
        }
      
        .column-filters {
          min-height: ${sheshaStyles.columnFilterHeight};
          max-height: ${sheshaStyles.columnFilterHeight};
          overflow-y: auto;
        }
    `);

  return {
    shaIndexTableColumnFilters,
  };
});
