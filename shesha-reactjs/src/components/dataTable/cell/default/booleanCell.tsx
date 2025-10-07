import React from 'react';
import { IDataCellProps } from '../interfaces';

export interface IBooleanCellCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {}

export const BooleanCell = <D extends object = {}, V = any>(props: IBooleanCellCellProps<D, V>): JSX.Element => {
  return <>{props.value ? 'Yes' : 'No'}</>;
};

export default BooleanCell;
