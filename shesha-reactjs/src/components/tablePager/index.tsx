import React, { CSSProperties, FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { PHONE_SIZE_QUERY } from '@/shesha-constants/media-queries';
import { useComponentValidation, useDataTable, useForm } from '@/providers';
import TablePaging from './tablePaging';
import TableNoPaging from './tableNoPaging';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { Pagination } from 'antd';
import { useStyles } from '@/designer-components/dataTable/tableContext/styles';
import { useIsInsideDataContext } from '@/utils/form/useComponentHierarchyCheck';
import { validationError } from '@/designer-components/dataTable/utils';

const outsideContextValidationError = validationError('Table Pager');

export interface ITablePagerProps {
  id: string;
  showSizeChanger?: boolean;
  showTotalItems?: boolean;
  font?: IFontValue;
  shadow?: IShadowValue;
  background?: IBackgroundValue;
  border?: IBorderValue;
  style?: CSSProperties;
}

type EmptyPagerProps = {
  style?: CSSProperties;
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

export const TablePager: FC<ITablePagerProps> = ({ id, showSizeChanger, showTotalItems, style }) => {
  const dataTableContext = useDataTable(false);
  const { formMode } = useForm();


  // Use stable hook that only recomputes when actual hierarchy changes
  const isInsideDataContextInMarkup = useIsInsideDataContext(id);

  const shouldShowError = formMode === 'designer' && !isInsideDataContextInMarkup;

  useComponentValidation(
    () => shouldShowError ? outsideContextValidationError : undefined,
    [shouldShowError],
  );

  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  // Fallback UI when not in a Data Context
  if (!dataTableContext) {
    return (<EmptyPager style={style} />);
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
    return (<EmptyPager style={style} />);
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
