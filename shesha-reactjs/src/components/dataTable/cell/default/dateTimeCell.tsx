import moment from 'moment';
import React from 'react';
import { IDataCellProps } from '../interfaces';

export interface IDateTimeCellProps<D extends object = {}, V = any> extends IDataCellProps<D, V> {}

export const DateTimeCell = <D extends object = {}, V = any>(props: IDateTimeCellProps<D, V>): JSX.Element => {
  return props.value ? <>{moment(props.value).format(props.propertyMeta?.dataFormat || 'DD/MM/YYYY HH:mm')}</> : null;
};

export default DateTimeCell;
