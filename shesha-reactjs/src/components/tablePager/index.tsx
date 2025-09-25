import React, { CSSProperties, FC } from 'react';
import { useMediaQuery } from 'react-responsive';
import {PHONE_SIZE_QUERY } from '@/shesha-constants/media-queries';
import { useDataTable } from '@/providers';
import TablePaging from './tablePaging';
import TableNoPaging from './tableNoPaging';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';

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
  const {
    pageSizeOptions,
    currentPage,
    totalRows,
    selectedPageSize,
    setCurrentPage,
    changePageSize,
    dataFetchingMode,
  } = useDataTable();


  const hideTotalItems = useMediaQuery({
    query: PHONE_SIZE_QUERY,
  });

  if (totalRows === undefined || totalRows === null) return null;

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
