import React, { FC } from 'react';
import { useMedia } from 'react-use';

export interface ITablePagerBaseProps {
  /** Total number of rows to display on the table */
  totalRows: number;
}

export const TableNoPaging: FC<ITablePagerBaseProps> = ({
  totalRows
}) => {
  const isWider = useMedia('(min-width: 1202px)');

  if (!isWider) return null;

  return (
    <span>Total {totalRows} items</span>
  );
};

export default TableNoPaging;
