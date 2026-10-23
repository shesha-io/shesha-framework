import moment from 'moment';
import { ReactNode } from 'react';
import { IDataCellProps } from '../interfaces';
import { asNumber } from '../utils';

type ITimeCellProps<D extends object = object> = IDataCellProps<D, unknown>;

const TimeCell = <D extends object = object>(props: ITimeCellProps<D>): ReactNode => {
  const numberValue = asNumber(props.value);
  return numberValue || numberValue === 0 ? <>{moment.utc(numberValue * 1000).format(props.propertyMeta?.dataFormat || 'HH:mm')}</> : undefined;
};

export default TimeCell;
