import React, { FC, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useDebouncedCallback } from 'use-debounce/lib';
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

  const [ pageSize, setPageSize ] = useState<number>(null)

  const hideSizeChanger = useMediaQuery({
    query: DESKTOP_SIZE_QUERY,
  });

  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  // change page size with delay to debounce fetching data
  const init = useDebouncedCallback(() => {
     if (!pageSize) {
      changePageSize(defaultPageSize);
      setPageSize(defaultPageSize);
    } else
      setPageSize(selectedPageSize);
  }, 300)

  useEffect(() => { 
    init();
  }, [selectedPageSize])

  return (
    <>
      {Boolean(pageSize) &&
      <TablePagerBase
        {...{
          pageSizeOptions,
          currentPage,
          totalRows,
          selectedPageSize: pageSize,
          showSizeChanger: !hideSizeChanger && showSizeChanger,
          showTotalItems: !hideTotalItems && showTotalItems,
          setCurrentPage,
          changePageSize,
        }}
      />
      }
    </>
  );
};

export default TablePager;
