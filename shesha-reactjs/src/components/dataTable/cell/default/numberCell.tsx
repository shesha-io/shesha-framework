import React from 'react';
import { getNumberFormat } from '@/utils/string';
import { IDataCellProps } from '../interfaces';

export interface INumberCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {}

export const NumberCell = <D extends object = {}, V = number>(props: INumberCellProps<D, V>) => {
  const displayValue = props.value
    ? getNumberFormat(props.value.toString(), props.propertyMeta?.dataFormat)
    : null;

  return <>{displayValue}</>;
};

export default NumberCell;
