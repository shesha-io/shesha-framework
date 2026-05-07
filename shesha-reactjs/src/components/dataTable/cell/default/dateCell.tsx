import moment from 'moment';
import React, { ReactNode } from 'react';
import { IDataCellProps } from '../interfaces';

export type IDateCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

export const DateCell = <D extends object = object, V = unknown>(props: IDateCellProps<D, V>): ReactNode => {
  return props.value ? <>{moment(props.value).format(props.propertyMeta?.dataFormat || 'DD/MM/YYYY')}</> : undefined;
};

export default DateCell;
