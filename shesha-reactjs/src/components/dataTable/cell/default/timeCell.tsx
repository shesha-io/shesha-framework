import moment from 'moment';
import React from 'react';
import { IDataCellProps } from '../interfaces';
import { asNumber } from '../utils';

export type ITimeCellProps<D extends object = object, V = any> = IDataCellProps<D, V>;

export const TimeCell = <D extends object = object, V = number>(props: ITimeCellProps<D, V>): JSX.Element => {
  const numberValue = asNumber(props.value);
  return numberValue || numberValue === 0 ? <>{moment.utc(numberValue * 1000).format(props.propertyMeta?.dataFormat || 'HH:mm')}</> : null;
};

export default TimeCell;
