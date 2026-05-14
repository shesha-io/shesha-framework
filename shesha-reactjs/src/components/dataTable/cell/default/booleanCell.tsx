import React, { ReactNode } from 'react';
import { IDataCellProps } from '../interfaces';

export type IBooleanCellCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

export const BooleanCell = <D extends object = object, V = unknown>(props: IBooleanCellCellProps<D, V>): ReactNode => {
  return <>{props.value ? 'Yes' : 'No'}</>;
};

export default BooleanCell;
