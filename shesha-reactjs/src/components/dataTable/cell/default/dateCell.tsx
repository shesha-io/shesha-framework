import moment from 'moment';
import React from 'react';
import { IDataCellProps } from '../interfaces';

export type IDateCellProps<D extends object = object, V = any> = IDataCellProps<D, V>;

export const DateCell = <D extends object = object, V = any>(props: IDateCellProps<D, V>): JSX.Element => {
  return props.value ? <>{moment(props.value).format(props.propertyMeta?.dataFormat || 'DD/MM/YYYY')}</> : null;
};

export default DateCell;
