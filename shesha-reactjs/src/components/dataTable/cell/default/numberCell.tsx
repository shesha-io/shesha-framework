import { ReactNode } from 'react';
import { numberToFormattedString } from '@/utils/string';
import { IDataCellProps } from '../interfaces';

type INumberCellProps<D extends object = object> = IDataCellProps<D, unknown>;

const NumberCell = <D extends object = object>(props: INumberCellProps<D>): ReactNode => {
  const displayValue = props.value
    ? numberToFormattedString(props.value.toString(), props.propertyMeta?.dataFormat ?? undefined)
    : null;

  return <>{displayValue}</>;
};

export default NumberCell;
