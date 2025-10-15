import React from 'react';
import { IDataCellProps } from '../interfaces';

export type IBooleanCellCellProps<D extends object = object, V = any> = IDataCellProps<D, V>;

export const BooleanCell = <D extends object = object, V = any>(props: IBooleanCellCellProps<D, V>): JSX.Element => {
  return <>{props.value ? 'Yes' : 'No'}</>;
};

export default BooleanCell;
