import moment from 'moment';
import { ReactNode } from 'react';
import { IDataCellProps } from '../interfaces';

type IDateCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

const DateCell = <D extends object = object, V = unknown>(props: IDateCellProps<D, V>): ReactNode => {
  return props.value ? <>{moment(props.value).format(props.propertyMeta?.dataFormat || 'DD/MM/YYYY')}</> : undefined;
};

export default DateCell;
