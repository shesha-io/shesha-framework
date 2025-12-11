import React, { CSSProperties, FC, ReactElement } from 'react';
import { useMediaQuery } from 'react-responsive';
import { PHONE_SIZE_QUERY } from '@/shesha-constants/media-queries';
import { useDataTable } from '@/providers';
import TablePaging from './tablePaging';
import TableNoPaging from './tableNoPaging';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { Pagination } from 'antd';
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

type EmptyPagerProps = {
  message: ReactElement;
  style: CSSProperties;
};

const EmptyPager: FC<EmptyPagerProps> = ({ style }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.tablePagerContainer} style={style}>
      <div className={styles.disabledComponentWrapper}>
        <Pagination
          size="small"
          disabled
          current={1}
          onChange={() => {
            // noop
          }}
          total={100}
          pageSize={10}
          showSizeChanger
          showQuickJumper={false}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        />
      </div>
    </div>
  );
};

export const TablePager: FC<ITablePagerProps> = ({ showSizeChanger, showTotalItems, style }) => {
  const dataTableContext = useDataTable(false);

  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  // Fallback UI when not in a Data Context
  if (!dataTableContext) {
    return (<EmptyPager message={<>The Table Pager component must be<br />placed inside of a Data Context<br />component to be fully functional.</>} style={style} />);
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
    return (<EmptyPager message={<>The Table Pager is within a Data Context<br />but no sibling Data Table or Data List<br />component has been configured with<br />columns or items.</>} style={style} />);
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
