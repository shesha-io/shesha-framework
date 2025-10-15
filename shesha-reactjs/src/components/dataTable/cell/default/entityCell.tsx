import React from 'react';
import { IDataCellProps } from '../interfaces';

export type IEntityCellProps<D extends object = object, V = any> = IDataCellProps<D, V>;

export const EntityCell = <D extends object = object, V = any>(props: IEntityCellProps<D, V>): JSX.Element => {
  const { value } = props;
  if (!value) return null;

  const text = typeof value === 'object' ? value['displayText'] ?? value['_displayName'] : value.toString();

  return <>{text}</>;
};

export default EntityCell;
