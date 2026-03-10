import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const columnNames = "column-names";
  const columnName = "column-name";
  const shaIndexTableColumnVisibilityToggle = cx("sha-index-table-column-visibility-toggle", css`
        .${prefixCls}-input-search {
            margin-bottom: ${sheshaStyles.paddingLG}px;
        }

        .${columnNames} {
            padding-bottom: ${sheshaStyles.paddingLG}px;
            min-height: ${sheshaStyles.columnFilterHeight};
            overflow-y: auto;

            .${columnName} {
                margin-bottom: ${sheshaStyles.paddingLG}px;
            }
        }
    `);

  return {
    shaIndexTableColumnVisibilityToggle,
    columnNames,
    columnName,
  };
});
