import { CSSProperties, FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { PHONE_SIZE_QUERY } from '@/shesha-constants/media-queries';
import { IStyleValue, useComponentValidation, useDataTableStoreOrUndefined } from '@/providers';
import TablePaging from './tablePaging';
import TableNoPaging from './tableNoPaging';
import { validationError } from '@/designer-components/dataTable/utils';
import { isDefined } from '@/utils/nullables';

const outsideContextValidationError = validationError('Table Pager');

export interface ITablePagerProps extends Pick<IStyleValue, 'font' | 'stylingBoxJson'> {
  showSizeChanger?: boolean | undefined;
  showTotalItems?: boolean | undefined;
  style?: CSSProperties | undefined;
}

const emptyFunc = (): void => {};

const EmptyPager: FC<ITablePagerProps> = (props) => {
  return (
    <TablePaging
      disabled
      pageSizeOptions={[10]}
      currentPage={1}
      totalRows={100}
      selectedPageSize={10}
      showSizeChanger
      showTotalItems
      setCurrentPage={emptyFunc}
      changePageSize={emptyFunc}
      font={props.font}
      stylingBoxJson={props.stylingBoxJson}
      style={props.style}
    />
  );
};

export const TablePager: FC<ITablePagerProps> = (props) => {
  const dataTableContext = useDataTableStoreOrUndefined();

  useComponentValidation(() => !dataTableContext ? outsideContextValidationError : undefined, [dataTableContext]);

  const hideTotalItems = useMediaQuery({ query: PHONE_SIZE_QUERY });

  const { showSizeChanger, showTotalItems, font, stylingBoxJson, style } = props;

  // Fallback UI when not in a Data Context
  if (!dataTableContext) return (<EmptyPager {...props} />);

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
  if (!isDefined(totalRows)) return (<EmptyPager {...props} />);

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
        font,
        stylingBoxJson,
        style,
      }}
    />
  ) : (
    <TableNoPaging totalRows={totalRows} style={style} font={props.font} stylingBoxJson={props.stylingBoxJson} />
  );
};

export default TablePager;
