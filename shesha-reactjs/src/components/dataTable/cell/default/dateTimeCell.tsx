import moment from 'moment';
import { ReactNode } from 'react';
import { IDataCellProps } from '../interfaces';

type IDateTimeCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

const DateTimeCell = <D extends object = object, V = unknown>(props: IDateTimeCellProps<D, V>): ReactNode => {
  return props.value ? <>{moment(props.value).format(props.propertyMeta?.dataFormat || 'DD/MM/YYYY HH:mm')}</> : undefined;
};

export default DateTimeCell;
