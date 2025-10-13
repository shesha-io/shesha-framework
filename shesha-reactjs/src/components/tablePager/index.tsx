import React, { CSSProperties, FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { PHONE_SIZE_QUERY } from '@/shesha-constants/media-queries';
import { useDataTable } from '@/providers';
import TablePaging from './tablePaging';
import TableNoPaging from './tableNoPaging';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, Pagination } from 'antd';
import { useTheme } from '@/providers/theme';
import { useStyles } from '@/designer-components/dataTable/tableContext/styles';

export interface ITablePagerProps {
  showSizeChanger?: boolean;
  showTotalItems?: boolean;
  font?: IFontValue;
  shadow?: IShadowValue;
  background?: IBackgroundValue;
  border?: IBorderValue;
  style?: CSSProperties;
}

export const TablePager: FC<ITablePagerProps> = ({ showSizeChanger, showTotalItems, style }) => {
  const dataTableContext = useDataTable(false);
  const { theme } = useTheme();
  const { styles } = useStyles();

  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  // Fallback UI when not in a Data Context
  if (!dataTableContext) {
    return (
      <>
        <style>
          {styles.quickSearchPopoverArrowStyles}
        </style>
        <div className={styles.tablePagerContainer} style={style}>
          <div style={{ opacity: 0.5 }}>
            <Pagination
              size="small"
              disabled
              current={1}
              total={100}
              pageSize={10}
              showSizeChanger
              showQuickJumper={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
          </div>
          <Popover
            placement="right"
            title="Hint:"
            rootClassName={styles.tablePagerHintPopover}
            classNames={{
              body: styles.tablePagerHintPopover,
            }}
            content={(
              <p>The Table Pager component must be<br />placed inside of a Data Context<br />component to be fully functional.
                <br />
                <br />
                <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
              </p>
            )}
          >
            <InfoCircleOutlined style={{ color: theme.application?.warningColor, cursor: 'help' }} />
          </Popover>
        </div>
      </>
    );
  }

  const {
    pageSizeOptions,
    currentPage,
    totalRows,
    selectedPageSize,
    setCurrentPage,
    changePageSize,
    dataFetchingMode,
  } = dataTableContext;

  // Fallback UI when in Data Context but no configured DataTable/DataList
  if (totalRows === undefined || totalRows === null) {
    return (
      <>
        <style>
          {styles.quickSearchPopoverArrowStyles}
        </style>
        <div className={styles.tablePagerContainer} style={style}>
          <div style={{ opacity: 0.5 }}>
            <Pagination
              size="small"
              disabled
              current={1}
              total={100}
              pageSize={10}
              showSizeChanger
              showQuickJumper={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
          </div>
          <Popover
            placement="right"
            title="Hint:"
            rootClassName={styles.tablePagerHintPopover}
            classNames={{
              body: styles.tablePagerHintPopover,
            }}
            content={(
              <p>The Table Pager is within a Data Context<br />but no sibling Data Table or Data List<br />component has been configured with<br />columns or items.
                <br />
                <br />
                <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
              </p>
            )}
          >
            <InfoCircleOutlined style={{ color: theme.application?.warningColor, cursor: 'help' }} />
          </Popover>
        </div>
      </>
    );
  }

  return dataFetchingMode === 'paging' ? (
    <TablePaging
      {...{
        pageSizeOptions,
        currentPage,
        totalRows,
        selectedPageSize,
        showSizeChanger: !hideTotalItems && showSizeChanger,
        showTotalItems: !hideTotalItems && showTotalItems,
        setCurrentPage,
        changePageSize,
        dataFetchingMode,
        style,
      }}
    />
  ) : (
    <TableNoPaging totalRows={totalRows} style={style} />
  );
};

export default TablePager;
