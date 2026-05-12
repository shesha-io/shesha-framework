import React, { ReactNode } from 'react';
import { IDataCellProps } from '../interfaces';
import { getFirstNonEmptyStringPropertyOrUndefined } from '@/utils/object';

export type IEntityCellProps<D extends object = object, V = unknown> = IDataCellProps<D, V>;

export const EntityCell = <D extends object = object, V = unknown>(props: IEntityCellProps<D, V>): ReactNode => {
  const { value } = props;
  if (!value) return null;

  const text = typeof value === 'object'
    ? getFirstNonEmptyStringPropertyOrUndefined(value, ['displayText', '_displayName'])
    : value.toString();

  return <>{text}</>;
};

export default EntityCell;
