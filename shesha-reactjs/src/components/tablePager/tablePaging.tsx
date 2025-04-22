import React, { FC, useEffect } from 'react';
import { Pagination } from 'antd';
import { useMedia } from 'react-use';
import { useStyles } from './style';

export interface ITablePagerBaseProps {
  /** Whether this component */
  disabled?: boolean;

  /** The options for page sizes */
  pageSizeOptions: number[];

  /** The current page the table is on */
  currentPage: number;

  /** Total number of rows to display on the table */
  totalRows: number;

  /** the selected page size of the table */
  selectedPageSize: number;

  /** show size changer of the table */
  showSizeChanger?: boolean;

  /** show size of table rows */
  showTotalItems?: boolean;

  /** A function to set the page the table should be on */
  setCurrentPage: (page: number) => void;

  /** A function to change  */
  changePageSize: (size: number) => void;
  style?: any;
}

export const TablePaging: FC<ITablePagerBaseProps> = ({
  disabled = false,
  pageSizeOptions,
  currentPage,
  totalRows,
  selectedPageSize,
  showSizeChanger = true,
  showTotalItems = true,
  setCurrentPage,
  changePageSize,
  style,
}) => {
  const isWider = useMedia('(min-width: 1202px)');
  const { styles } = useStyles({ style });

  const onPageNumberChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    changePageSize(pageSize);
  };

  const onShowSizeChange = (current: number, size?: number) => {
    changePageSize(size);
    setCurrentPage(current);
  };

  const showTotal = (total: number, range: number[]) => {
    if (showTotalItems) {
      return total > 0 ? `${range[0]}-${range[1]} of ${total} items` : '0 items found';
    }

    return null;
  };

  useEffect(() => {
    if (!isNaN(selectedPageSize)) onShowSizeChange(1, selectedPageSize);
  }, [showSizeChanger]);

  if (!isWider) return null;

  return (
    <Pagination
      className={styles.pager}
      style={style}
      size="small"
      total={totalRows}
      pageSizeOptions={(pageSizeOptions || []).map((s) => `${s}`)}
      current={currentPage}
      pageSize={selectedPageSize}
      showSizeChanger={showSizeChanger}
      onChange={onPageNumberChange}
      onShowSizeChange={onShowSizeChange}
      showLessItems
      disabled={disabled}
      showTotal={showTotal} // TODO: add `filtered from xxx` here if needed
    />
  );
};

export default TablePaging;
