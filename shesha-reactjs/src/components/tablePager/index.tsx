import React, { FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { DESKTOP_SIZE_QUERY, PHONE_SIZE_QUERY } from '@/shesha-constants/media-queries';
import { useDataTable } from '../../providers';
import TablePaging from './tablePaging';
import TableNoPaging from './tableNoPaging';

export interface ITablePagerProps {
  showSizeChanger?: boolean;
  showTotalItems?: boolean;
}

export const TablePager: FC<ITablePagerProps> = ({ showSizeChanger, showTotalItems }) => {
  const { pageSizeOptions, currentPage, totalRows, selectedPageSize, setCurrentPage, changePageSize, dataFetchingMode } = useDataTable();

  const hideSizeChanger = useMediaQuery({
    query: DESKTOP_SIZE_QUERY,
  });

  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  if (totalRows === undefined || totalRows === null)
    return null;

  return dataFetchingMode === 'paging'
  ? (
      <TablePaging
        {...{
          pageSizeOptions,
          currentPage,
          totalRows,
          selectedPageSize,
          showSizeChanger: !hideSizeChanger && showSizeChanger,
          showTotalItems: !hideTotalItems && showTotalItems,
          setCurrentPage,
          changePageSize,
          dataFetchingMode,
        }}
      />
  )
  : <TableNoPaging totalRows={totalRows}/>;
};

export default TablePager;
