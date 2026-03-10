import React from 'react';
import { getNumberFormat } from '@/utils/string';
import { IDataCellProps } from '../interfaces';

export type INumberCellProps<D extends object = object, V = any> = IDataCellProps<D, V>;

export const NumberCell = <D extends object = object, V = number>(props: INumberCellProps<D, V>): JSX.Element => {
  const displayValue = props.value
    ? getNumberFormat(props.value.toString(), props.propertyMeta?.dataFormat)
    : null;

  return <>{displayValue}</>;
};

export default NumberCell;
