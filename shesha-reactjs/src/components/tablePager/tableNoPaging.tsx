import React, { CSSProperties, FC } from 'react';
import { useMedia } from 'react-use';

export interface ITablePagerBaseProps {
  /** Total number of rows to display on the table */
  totalRows: number;
  style?: CSSProperties;
}

export const TableNoPaging: FC<ITablePagerBaseProps> = ({
  totalRows,
  style,
}) => {
  const isWider = useMedia('(min-width: 1202px)');

  if (!isWider) return null;

  return (
    <span style={style}>Total {totalRows} items</span>
  );
};

export default TableNoPaging;
