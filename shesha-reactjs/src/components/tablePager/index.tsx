import React, { FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import { DESKTOP_SIZE_QUERY, PHONE_SIZE_QUERY } from '../../constants/media-queries';
import { useDataTable } from '../../providers';
import TablePagerBase from '../tablePagerBase';

export interface ITablePagerProps {
  defaultPageSize?: number;
  showSizeChanger?: boolean;
  showTotalItems?: boolean;
}

export const TablePager: FC<ITablePagerProps> = ({ defaultPageSize, showSizeChanger, showTotalItems }) => {
  const { pageSizeOptions, currentPage, totalRows, selectedPageSize, setCurrentPage, changePageSize } = useDataTable();

  const hideSizeChanger = useMediaQuery({
    query: DESKTOP_SIZE_QUERY,
  });

  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  return (
    <TablePagerBase
      {...{
        pageSizeOptions,
        currentPage,
        totalRows,
        selectedPageSize: defaultPageSize || selectedPageSize,
        showSizeChanger: hideSizeChanger ? false : showSizeChanger,
        showTotalItems: hideTotalItems ? false : showTotalItems,
        setCurrentPage,
        changePageSize,
      }}
    />
  );
};

export default TablePager;
