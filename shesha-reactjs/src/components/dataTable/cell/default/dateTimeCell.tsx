import moment from 'moment';
import React from 'react';
import { IDataCellProps } from '../interfaces';

export type IDateTimeCellProps<D extends object = object, V = any> = IDataCellProps<D, V>;

export const DateTimeCell = <D extends object = object, V = any>(props: IDateTimeCellProps<D, V>): JSX.Element => {
  return props.value ? <>{moment(props.value).format(props.propertyMeta?.dataFormat || 'DD/MM/YYYY HH:mm')}</> : null;
};

export default DateTimeCell;
